import React, { useState, useEffect } from "react"
import ExploreTab from "./ExploreTab"
import MapTab from "./MapTab"
import FilterSidebar from "./FilterSidebar"
import FilterPills from "./FilterPills"
import LocationRequiredPrompt from "./LocationRequiredPrompt"
import LocationBlockedPrompt from "./LocationBlockedPrompt"
import LocationRefreshPrompt from "./LocationRefreshPrompt"
import ControlsBar from "./ControlsBar"
import 'mapbox-gl/dist/mapbox-gl.css';

// Geolocation configuration
const GEOLOCATION_CONFIG = {
  TIMEOUT_DURATION: 15000, // 15 seconds for our custom timeout
  API_TIMEOUT: 10000, // 10 seconds for the geolocation API timeout
  CACHE_DURATION: 30 * 60 * 1000, // 30 minutes in milliseconds
  HIGH_ACCURACY: true
}

const initialTabs = [
  { name: "Explore", href: "#" },
  { name: "Map", href: "#" },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

export default function Home() {
  const [tabs, setTabs] = useState(() => {
    // Try to get the saved tab index from localStorage
    const savedTabIndex = localStorage.getItem('petakopi_active_tab');
    const activeIndex = savedTabIndex !== null ? parseInt(savedTabIndex, 10) : 0;

    return initialTabs.map((tab, index) => ({
      ...tab,
      current: index === activeIndex
    }));
  });

  const [activeTab, setActiveTab] = useState(() => {
    // Try to get the saved tab index from localStorage
    const savedTabIndex = localStorage.getItem('petakopi_active_tab');
    return savedTabIndex !== null ? parseInt(savedTabIndex, 10) : 0;
  });

  // Explore tab state
  const [everywhereShops, setEverywhereShops] = useState([])
  const [everywhereNextCursor, setEverywhereNextCursor] = useState(null)
  const [everywherePrevCursor, setEverywherePrevCursor] = useState(null)
  const [everywhereHasNext, setEverywhereHasNext] = useState(false)
  const [everywhereHasPrev, setEverywhereHasPrev] = useState(false)
  const [everywhereLoading, setEverywhereLoading] = useState(true)
  const [everywhereDistance, setEverywhereDistance] = useState(null)

  // Location state
  const [userLocation, setUserLocation] = useState(null)
  const [locationPermission, setLocationPermission] = useState("")
  const [selectedDistance, setSelectedDistance] = useState(5)

  // Filter sidebar state
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false)
  const [listFilters, setListFilters] = useState({})
  const [mapFilters, setMapFilters] = useState({})

  // Helper function to get current filters based on active tab
  const getCurrentFilters = () => activeTab === 0 ? listFilters : mapFilters
  const setCurrentFilters = (filters) => activeTab === 0 ? setListFilters(filters) : setMapFilters(filters)

  // View type state (card or list)
  const [viewType, setViewType] = useState(() => {
    // Try to get the saved view type from localStorage
    const savedViewType = localStorage.getItem('petakopi_view_type');
    return savedViewType || "card"; // Default to card view if not found
  });

  const [showLocationPrompt, setShowLocationPrompt] = useState(false)
  const [showLocationBlockedPrompt, setShowLocationBlockedPrompt] = useState(false)
  const [showLocationRefreshPrompt, setShowLocationRefreshPrompt] = useState(false)

  // Helper function to add filters to URL
  const applyFiltersToUrl = (url, filters) => {
    // Add keyword filter if it exists (only for list view)
    if (activeTab === 0 && filters.keyword) {
      url.searchParams.append('keyword', filters.keyword);
    }

    // Add tags filter if it exists (multiple tags)
    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach(tag => {
        url.searchParams.append('tags[]', tag);
      });
    }

    // Add state filter if it exists (only for list view)
    if (activeTab === 0 && filters.state) {
      url.searchParams.append('state', filters.state);
    }

    // Add district filter if it exists (only for list view)
    if (activeTab === 0 && filters.district) {
      url.searchParams.append('district', filters.district);
    }

    // Add opened filter if it exists
    if (filters.opened) {
      url.searchParams.append('opened', filters.opened);
    }

    return url;
  };

  // Initial data loading for all tabs
  useEffect(() => {
    // Load explore data only when component mounts and data is empty
    if (everywhereShops.length === 0) {
      setEverywhereLoading(true)
      fetchEverywhereShops()
    }
  }, []) // Empty dependency array - only run once on mount

  // Add initial location permission check
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
        if (permissionStatus.state === 'granted') {
          setLocationPermission('granted')
          requestLocationPermission()
        } else if (permissionStatus.state === 'denied') {
          setLocationPermission('denied')
        }
      })
    }
  }, [])

  const requestLocationPermission = () => {
    // Set to prompt state to show loading indicator
    setLocationPermission("prompt")

    // Set a timeout to handle cases where the geolocation request gets stuck
    const locationTimeout = setTimeout(() => {
      // If we're still in "prompt" state after the timeout, assume it failed
      if (locationPermission === "prompt") {
        console.error("Location request timed out")
        setLocationPermission("timeout")
      }
    }, GEOLOCATION_CONFIG.TIMEOUT_DURATION)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(locationTimeout) // Clear the timeout on success
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
          console.log("New location received:", newLocation)
          setUserLocation(newLocation)
          setLocationPermission("granted")
        },
        (error) => {
          clearTimeout(locationTimeout) // Clear the timeout on error
          console.error("Error getting location:", error)
          // PERMISSION_DENIED = 1
          if (error.code === 1) {
            // Permission was denied
            setLocationPermission("denied")
            setShowLocationBlockedPrompt(true)
          } else {
            setLocationPermission("denied")
          }
        },
        {
          enableHighAccuracy: GEOLOCATION_CONFIG.HIGH_ACCURACY,
          timeout: GEOLOCATION_CONFIG.API_TIMEOUT,
          maximumAge: GEOLOCATION_CONFIG.CACHE_DURATION
        }
      )
    } else {
      clearTimeout(locationTimeout) // Clear the timeout if geolocation is not supported
      console.error("Geolocation is not supported by this browser")
      setLocationPermission("denied")
    }
  }

  const fetchEverywhereShops = async (cursor = null, direction = 'next') => {
    setEverywhereLoading(true)
    try {
      const url = new URL('/api/v1/coffee_shops', window.location.origin);

      // Apply all filters
      applyFiltersToUrl(url, getCurrentFilters());

      // Add distance filter if set and location is available
      if (everywhereDistance !== null && userLocation && everywhereDistance !== 0) {
        url.searchParams.append('distance', everywhereDistance);
        url.searchParams.append('lat', userLocation.latitude);
        url.searchParams.append('lng', userLocation.longitude);
      }

      if (cursor) {
        url.searchParams.append(direction === 'next' ? 'after' : 'before', cursor);
      }

      console.log("Fetching explore coffee shops with URL:", url.toString());
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === "success" && data.data && data.data.coffee_shops) {
        setEverywhereShops(data.data.coffee_shops)
        setEverywhereNextCursor(data.data.pages.next_cursor)
        setEverywherePrevCursor(data.data.pages.prev_cursor)
        setEverywhereHasNext(data.data.pages.has_next)
        setEverywhereHasPrev(data.data.pages.has_prev)
      } else {
        console.error('Unexpected response format:', data)
        setEverywhereShops([])
        setEverywhereHasNext(false)
        setEverywhereHasPrev(false)
      }
    } catch (error) {
      console.error('Error fetching explore coffee shops:', error)
      setEverywhereShops([])
      setEverywhereHasNext(false)
      setEverywhereHasPrev(false)
    } finally {
      setEverywhereLoading(false)
    }
  }

  const handleApplyFilters = (newFilters) => {
    console.log("Applying filters:", newFilters)

    // Remove the timestamp if it exists (used just to force updates)
    const { _timestamp, ...actualFilters } = newFilters

    // Check if distance filter is selected but location is not available
    if (actualFilters.distance && !userLocation && locationPermission !== "granted") {
      setShowLocationPrompt(true)
      return
    }

    // Set filters state with a new object to ensure React detects the change
    setCurrentFilters({ ...actualFilters })

    // Update distance filter if present
    if (actualFilters.distance !== undefined) {
      setEverywhereDistance(actualFilters.distance);
    }

    // Force immediate re-render by setting loading state
    if (activeTab === 0) {
      // Reset pagination and fetch with new filters
      setEverywhereShops([])
      setEverywhereNextCursor(null)
      setEverywherePrevCursor(null)
      setEverywhereHasNext(false)
      setEverywhereHasPrev(false)
      setEverywhereLoading(true)

      // Directly fetch data here instead of relying on fetchEverywhereShops
      const url = new URL('/api/v1/coffee_shops', window.location.origin);

      // Only apply filters if they exist and have values
      if (Object.keys(actualFilters).length > 0) {
        // Apply all filters
        applyFiltersToUrl(url, actualFilters);

        // Add distance filter if set and location is available
        if (actualFilters.distance !== null && userLocation && actualFilters.distance !== 0) {
          url.searchParams.append('distance', actualFilters.distance);
          url.searchParams.append('lat', userLocation.latitude);
          url.searchParams.append('lng', userLocation.longitude);
        }
      }

      console.log("Directly fetching explore with filters:", url.toString());

      fetch(url)
        .then(response => response.json())
        .then(data => {
          if (data.status === "success" && data.data && data.data.coffee_shops) {
            setEverywhereShops(data.data.coffee_shops)
            setEverywhereNextCursor(data.data.pages.next_cursor)
            setEverywherePrevCursor(data.data.pages.prev_cursor)
            setEverywhereHasNext(data.data.pages.has_next)
            setEverywhereHasPrev(data.data.pages.has_prev)
          } else {
            console.error('Unexpected response format:', data)
            setEverywhereShops([])
            setEverywhereHasNext(false)
            setEverywhereHasPrev(false)
          }
          setEverywhereLoading(false)
        })
        .catch(error => {
          console.error('Error fetching explore coffee shops:', error)
          setEverywhereShops([])
          setEverywhereHasNext(false)
          setEverywhereHasPrev(false)
          setEverywhereLoading(false)
        });
    }
  }

  const handleNextPage = () => {
    if (activeTab === 0 && everywhereHasNext) {
      fetchEverywhereShops(everywhereNextCursor, 'next')
    }
  }

  const handlePrevPage = () => {
    if (activeTab === 0 && everywhereHasPrev) {
      fetchEverywhereShops(everywherePrevCursor, 'prev')
    }
  }

  const handleTabChange = (index) => {
    setActiveTab(index)
    setTabs(
      tabs.map((tab, i) => ({
        ...tab,
        current: i === index
      }))
    )

    // Save the active tab index to localStorage
    localStorage.setItem('petakopi_active_tab', index.toString());
  }

  const handleDistanceChange = (distance) => {
    setSelectedDistance(distance)
    if (userLocation && locationPermission === "granted") {
      // Refetch shops with new distance
      setEverywhereShops([])
      setEverywhereNextCursor(null)
      setEverywherePrevCursor(null)
      setEverywhereHasNext(false)
      setEverywhereHasPrev(false)
      setEverywhereLoading(true)
      fetchEverywhereShops()
    }
  }

  const handleLocationRequest = () => {
    setShowLocationPrompt(false)
    requestLocationPermission()
  }

  const handleLocationPillClick = () => {
    if (locationPermission === "granted") {
      if (userLocation) {
        // If we already have location, just show the refresh prompt
        setShowLocationRefreshPrompt(true);
      } else {
        // If we have permission but no location, request it
        requestLocationPermission();
      }
    } else {
      // If we don't have permission, request it
      requestLocationPermission();
    }
  };

  const handleLocationRefresh = () => {
    setShowLocationRefreshPrompt(false);
    // Set loading state immediately
    setLocationPermission("prompt");
    // Clear current location
    setUserLocation(null);
    // Request new location
    requestLocationPermission();
  };

  // Pagination component
  const Pagination = ({ hasNext, hasPrev, onNext, onPrev, loading }) => {
    const handleNext = () => {
      if (hasNext && !loading) {
        onNext();
        // Scroll to top after data loads
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      }
    };

    const handlePrev = () => {
      if (hasPrev && !loading) {
        onPrev();
        // Scroll to top after data loads
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      }
    };

    return (
      <div className="py-3 flex justify-end">
        <nav className="pagy-nav pagination" role="navigation">
          {hasPrev && !loading ? (
            <span className="page prev">
              <a href="#" onClick={(e) => { e.preventDefault(); handlePrev(); }}>Prev</a>
            </span>
          ) : (
            <span className="page prev disabled">Prev</span>
          )}

          {hasNext && !loading ? (
            <span className="page next">
              <a href="#" onClick={(e) => { e.preventDefault(); handleNext(); }}>Next</a>
            </span>
          ) : (
            <span className="page next disabled">Next</span>
          )}
        </nav>
      </div>
    );
  };

  // Add effect to save view type when it changes
  useEffect(() => {
    localStorage.setItem('petakopi_view_type', viewType);
  }, [viewType]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Controls bar - show in explore view only */}
      {activeTab !== 1 && (
        <ControlsBar
          isFilterSidebarOpen={isFilterSidebarOpen}
          setIsFilterSidebarOpen={setIsFilterSidebarOpen}
          filters={getCurrentFilters()}
          setFilters={setCurrentFilters}
          handleApplyFilters={handleApplyFilters}
          locationPermission={locationPermission}
          onRequestLocation={handleLocationPillClick}
          viewType={viewType}
          setViewType={setViewType}
          activeTab={activeTab}
        />
      )}

      {/* Main content area */}
      <div className={`${activeTab === 1 ? 'h-[calc(100vh-4rem)]' : ''} bg-gray-50 rounded-lg relative`}>
        {/* ExploreTab */}
        <div style={{ display: activeTab === 0 ? 'block' : 'none' }}>
          <ExploreTab
            everywhereShops={everywhereShops}
            everywhereLoading={everywhereLoading}
            viewType={viewType}
            userLocation={userLocation}
          />
          {(everywhereHasNext || everywhereHasPrev) && (
            <Pagination
              hasNext={everywhereHasNext}
              hasPrev={everywhereHasPrev}
              onNext={handleNextPage}
              onPrev={handlePrevPage}
              loading={everywhereLoading}
            />
          )}
        </div>
        {/* MapTab */}
        <div style={{
          display: activeTab === 1 ? 'block' : 'none',
          position: 'relative',
          height: 'calc(100vh - 4.5rem)',
          width: '100%',
          margin: 0,
          padding: 0,
          zIndex: 0
        }}>
          <MapTab
            userLocation={userLocation}
            activeTab={activeTab}
            setIsFilterSidebarOpen={setIsFilterSidebarOpen}
            filters={getCurrentFilters()}
          />
        </div>
      </div>

      {/* Floating Map button - only show when not in map view */}
      {activeTab !== 1 && (
        <button
          onClick={() => handleTabChange(1)}
          className="fixed bottom-6 right-6 bg-brown-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-brown-700 transition-colors flex items-center space-x-2 z-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span>Map</span>
        </button>
      )}

      {/* Floating List button - only show when in map view */}
      {activeTab === 1 && (
        <button
          onClick={() => handleTabChange(0)}
          className="fixed bottom-6 right-6 bg-brown-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-brown-700 transition-colors flex items-center space-x-2 z-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span>List</span>
        </button>
      )}

      {/* Filter Sidebar */}
      <FilterSidebar
        isOpen={isFilterSidebarOpen}
        onClose={() => setIsFilterSidebarOpen(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={getCurrentFilters()}
        locationPermission={locationPermission}
        activeTab={activeTab}
      />

      {/* Overlay when sidebar is open */}
      {isFilterSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsFilterSidebarOpen(false)}
        />
      )}

      {showLocationPrompt && (
        <LocationRequiredPrompt onRequestLocation={handleLocationRequest} />
      )}

      {showLocationBlockedPrompt && (
        <LocationBlockedPrompt
          onClose={() => setShowLocationBlockedPrompt(false)}
          onRequestLocation={requestLocationPermission}
        />
      )}

      {/* Location Refresh Prompt */}
      {showLocationRefreshPrompt && (
        <LocationRefreshPrompt
          onClose={() => setShowLocationRefreshPrompt(false)}
          onConfirm={handleLocationRefresh}
        />
      )}
    </div>
  )
}
