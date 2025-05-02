import React, { useState, useEffect } from "react"
import ExploreTab from "./ExploreTab"
import NearbyTab from "./NearbyTab"
import MapTab from "./MapTab"
import FilterSidebar from "./FilterSidebar"
import DistanceSelector from "./DistanceSelector"
import FilterPills from "./FilterPills"
import LocationRequiredPrompt from "./LocationRequiredPrompt"
import LocationBlockedPrompt from "./LocationBlockedPrompt"
import LocationRefreshPrompt from "./LocationRefreshPrompt"

// Geolocation configuration
const GEOLOCATION_CONFIG = {
  TIMEOUT_DURATION: 15000, // 15 seconds for our custom timeout
  API_TIMEOUT: 10000, // 10 seconds for the geolocation API timeout
  CACHE_DURATION: 30 * 60 * 1000, // 30 minutes in milliseconds
  HIGH_ACCURACY: true
}

const initialTabs = [
  { name: "Explore", href: "#" },
  { name: "Nearby", href: "#" },
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

  // Nearby tab state
  const [nearbyShops, setNearbyShops] = useState([])
  const [nearbyNextCursor, setNearbyNextCursor] = useState(null)
  const [nearbyPrevCursor, setNearbyPrevCursor] = useState(null)
  const [nearbyHasNext, setNearbyHasNext] = useState(false)
  const [nearbyHasPrev, setNearbyHasPrev] = useState(false)
  const [nearbyLoading, setNearbyLoading] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [locationPermission, setLocationPermission] = useState("") // Changed from "prompt" to empty string
  const [selectedDistance, setSelectedDistance] = useState(5) // Default to 5km

  // Filter sidebar state
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false)
  const [filters, setFilters] = useState({})

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
    // Add keyword filter if it exists
    if (filters.keyword) {
      url.searchParams.append('keyword', filters.keyword);
    }

    // Add tags filter if it exists (multiple tags)
    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach(tag => {
        url.searchParams.append('tags[]', tag);
      });
    }

    // Add state filter if it exists
    if (filters.state) {
      url.searchParams.append('state', filters.state);
    }

    // Add district filter if it exists
    if (filters.district) {
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
    // Load explore data when component mounts or map tab is active
    if ((activeTab === 0 || (activeTab === 2 && locationPermission !== "granted")) && everywhereShops.length === 0) {
      setEverywhereLoading(true)
      fetchEverywhereShops()
    }

    // Load nearby data when tab is active and we have location
    if (activeTab === 1 || (activeTab === 2 && locationPermission === "granted")) {
      if (locationPermission === "granted" && userLocation && nearbyShops.length === 0) {
        setNearbyLoading(true)
        fetchNearbyShops()
      } else if (locationPermission === "prompt") {
        requestLocationPermission()
      }
    }
  }, [activeTab, locationPermission, userLocation, selectedDistance])

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

  const fetchNearbyShops = async (cursor = null, direction = 'next') => {
    if (!userLocation) return;

    setNearbyLoading(true)
    try {
      const url = new URL('/api/v1/coffee_shops', window.location.origin);
      url.searchParams.append('lat', userLocation.latitude);
      url.searchParams.append('lng', userLocation.longitude);
      url.searchParams.append('distance', selectedDistance);

      // Apply all filters
      applyFiltersToUrl(url, filters);

      if (cursor) {
        url.searchParams.append(direction === 'next' ? 'after' : 'before', cursor);
      }

      console.log("Fetching nearby coffee shops with URL:", url.toString());
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === "success" && data.data && data.data.coffee_shops) {
        setNearbyShops(data.data.coffee_shops)
        setNearbyNextCursor(data.data.pages.next_cursor)
        setNearbyPrevCursor(data.data.pages.prev_cursor)
        setNearbyHasNext(data.data.pages.has_next)
        setNearbyHasPrev(data.data.pages.has_prev)
      } else {
        console.error('Unexpected response format:', data)
        setNearbyShops([])
        setNearbyHasNext(false)
        setNearbyHasPrev(false)
      }
    } catch (error) {
      console.error('Error fetching nearby coffee shops:', error)
      setNearbyShops([])
      setNearbyHasNext(false)
      setNearbyHasPrev(false)
    } finally {
      setNearbyLoading(false)
    }
  }

  const fetchEverywhereShops = async (cursor = null, direction = 'next') => {
    setEverywhereLoading(true)
    try {
      const url = new URL('/api/v1/coffee_shops', window.location.origin);

      // Apply all filters
      applyFiltersToUrl(url, filters);

      // Add distance filter if set
      if (everywhereDistance !== null) {
        url.searchParams.append('distance', everywhereDistance);
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
    setFilters({ ...actualFilters })

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

      // Apply all filters
      applyFiltersToUrl(url, actualFilters);

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
    } else if (activeTab === 1 && locationPermission === "granted") {
      // Reset pagination and fetch with new filters
      setNearbyShops([])
      setNearbyNextCursor(null)
      setNearbyPrevCursor(null)
      setNearbyHasNext(false)
      setNearbyHasPrev(false)
      setNearbyLoading(true)

      // Directly fetch data here instead of relying on fetchNearbyShops
      const url = new URL('/api/v1/coffee_shops', window.location.origin);
      url.searchParams.append('lat', userLocation.latitude);
      url.searchParams.append('lng', userLocation.longitude);
      url.searchParams.append('distance', selectedDistance);

      // Apply all filters
      applyFiltersToUrl(url, actualFilters);

      console.log("Directly fetching nearby with filters:", url.toString());

      fetch(url)
        .then(response => response.json())
        .then(data => {
          if (data.status === "success" && data.data && data.data.coffee_shops) {
            setNearbyShops(data.data.coffee_shops)
            setNearbyNextCursor(data.data.pages.next_cursor)
            setNearbyPrevCursor(data.data.pages.prev_cursor)
            setNearbyHasNext(data.data.pages.has_next)
            setNearbyHasPrev(data.data.pages.has_prev)
          } else {
            console.error('Unexpected response format:', data)
            setNearbyShops([])
            setNearbyHasNext(false)
            setNearbyHasPrev(false)
          }
          setNearbyLoading(false)
        })
        .catch(error => {
          console.error('Error fetching nearby coffee shops:', error)
          setNearbyShops([])
          setNearbyHasNext(false)
          setNearbyHasPrev(false)
          setNearbyLoading(false)
        });
    }
  }

  const handleNextPage = () => {
    if (activeTab === 0 && everywhereHasNext) {
      fetchEverywhereShops(everywhereNextCursor, 'next')
    } else if (activeTab === 1 && nearbyHasNext) {
      fetchNearbyShops(nearbyNextCursor, 'next')
    }
  }

  const handlePrevPage = () => {
    if (activeTab === 0 && everywhereHasPrev) {
      fetchEverywhereShops(everywherePrevCursor, 'prev')
    } else if (activeTab === 1 && nearbyHasPrev) {
      fetchNearbyShops(nearbyPrevCursor, 'prev')
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

    // Request location permission when switching to Nearby tab
    if (index === 1 && locationPermission !== "granted") {
      requestLocationPermission()
    }
    // When switching to Nearby tab with location permission already granted
    else if (index === 1 && locationPermission === "granted" && userLocation) {
      // Apply existing filters when switching to Nearby tab
      setNearbyLoading(true)

      // Create URL with current filters
      const url = new URL('/api/v1/coffee_shops', window.location.origin);
      url.searchParams.append('lat', userLocation.latitude);
      url.searchParams.append('lng', userLocation.longitude);
      url.searchParams.append('distance', selectedDistance);

      // Apply all current filters
      applyFiltersToUrl(url, filters);

      console.log("Fetching nearby with filters after tab change:", url.toString());

      fetch(url)
        .then(response => response.json())
        .then(data => {
          if (data.status === "success" && data.data && data.data.coffee_shops) {
            setNearbyShops(data.data.coffee_shops)
            setNearbyNextCursor(data.data.pages.next_cursor)
            setNearbyPrevCursor(data.data.pages.prev_cursor)
            setNearbyHasNext(data.data.pages.has_next)
            setNearbyHasPrev(data.data.pages.has_prev)
          } else {
            console.error('Unexpected response format:', data)
            setNearbyShops([])
            setNearbyHasNext(false)
            setNearbyHasPrev(false)
          }
          setNearbyLoading(false)
        })
        .catch(error => {
          console.error('Error fetching nearby coffee shops:', error)
          setNearbyShops([])
          setNearbyHasNext(false)
          setNearbyHasPrev(false)
          setNearbyLoading(false)
        });
    }
    // When switching to Explore tab
    else if (index === 0) {
      // Apply existing filters when switching to Explore tab
      setEverywhereLoading(true)

      // Create URL with current filters
      const url = new URL('/api/v1/coffee_shops', window.location.origin);

      // Apply all current filters
      applyFiltersToUrl(url, filters);

      console.log("Fetching explore with filters after tab change:", url.toString());

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

  const handleDistanceChange = (distance) => {
    setSelectedDistance(distance)
    if (userLocation && locationPermission === "granted") {
      // Refetch shops with new distance
      setNearbyShops([])
      setNearbyNextCursor(null)
      setNearbyPrevCursor(null)
      setNearbyHasNext(false)
      setNearbyHasPrev(false)
      setNearbyLoading(true)
      fetchNearbyShops()
    }
  }

  const handleLocationRequest = () => {
    setShowLocationPrompt(false)
    requestLocationPermission()
  }

  const handleLocationPillClick = () => {
    if (locationPermission === "granted") {
      setShowLocationRefreshPrompt(true);
    } else {
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
    <div className="min-h-screen bg-gray-50">
      {/* Main navigation tabs */}
      <div className="border-b border-gray-200">
        <div className="flex justify-between items-center">
          <nav className="-mb-px flex space-x-6">
            {tabs.map((tab, index) => (
              <button
                key={tab.name}
                onClick={() => handleTabChange(index)}
                className={classNames(
                  "whitespace-nowrap px-3 py-4 text-sm font-medium transition-all",
                  tab.current
                    ? "border-b-2 border-brown-500 text-brown-600"
                    : "border-b-2 border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                {tab.name}
              </button>
            ))}
          </nav>

          {/* Filter button moved to top right */}
          {activeTab !== 2 && (
            <button
              onClick={() => setIsFilterSidebarOpen(true)}
              className={`flex items-center justify-center h-10 w-10 rounded-lg transition-all relative ${
                Object.keys(filters).length > 0
                  ? "bg-brown-100 text-brown-700"
                  : "bg-gray-100 text-gray-700 hover:text-brown-600 hover:bg-brown-50"
              }`}
              aria-label="Filter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {Object.keys(filters).length > 0 && (
                <span className="absolute -top-2 -right-2 bg-brown-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                  {Object.keys(filters).length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Controls bar - moved below tabs for better mobile experience */}
      {activeTab !== 2 && (
        <div className="mt-4">
          {/* View type controls */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewType("card")}
                  className={`flex items-center px-3 py-1.5 text-sm rounded-md transition-all ${viewType === "card"
                    ? "bg-white text-brown-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Cards
                </button>
                <button
                  onClick={() => setViewType("list")}
                  className={`flex items-center px-3 py-1.5 text-sm rounded-md transition-all ${viewType === "list"
                    ? "bg-white text-brown-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  List
                </button>
              </div>
              {/* Filter pills */}
              <FilterPills
                filters={filters}
                setFilters={setFilters}
                handleApplyFilters={handleApplyFilters}
                locationPermission={locationPermission}
                onRequestLocation={handleLocationPillClick}
              />
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
          {activeTab === 0 && (
            <ExploreTab
              everywhereShops={everywhereShops}
              everywhereLoading={everywhereLoading}
              viewType={viewType}
            />
          )}

          {activeTab === 1 && (
            <NearbyTab
              nearbyShops={nearbyShops}
              nearbyLoading={nearbyLoading}
              locationPermission={locationPermission}
              requestLocationPermission={requestLocationPermission}
              viewType={viewType}
            />
          )}

          {activeTab === 2 && (
            <MapTab
              userLocation={userLocation}
            />
          )}
        </div>

        {/* Pagination controls - hide on map tab */}
        {activeTab === 0 && (everywhereHasNext || everywhereHasPrev) && (
          <Pagination
            hasNext={everywhereHasNext}
            hasPrev={everywhereHasPrev}
            onNext={handleNextPage}
            onPrev={handlePrevPage}
            loading={everywhereLoading}
          />
        )}

        {activeTab === 1 && locationPermission === "granted" && (nearbyHasNext || nearbyHasPrev) && (
          <Pagination
            hasNext={nearbyHasNext}
            hasPrev={nearbyHasPrev}
            onNext={handleNextPage}
            onPrev={handlePrevPage}
            loading={nearbyLoading}
          />
        )}
      </div>

      {/* Filter Sidebar */}
      <FilterSidebar
        isOpen={isFilterSidebarOpen}
        onClose={() => setIsFilterSidebarOpen(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
        locationPermission={locationPermission}
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
