import React, { useState, useEffect } from "react"
import ExploreTab from "./ExploreTab"
import NearbyTab from "./NearbyTab"
import MapTab from "./MapTab"
import FilterSidebar from "./FilterSidebar"
import DistanceSelector from "./DistanceSelector"

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

  // Nearby tab state
  const [nearbyShops, setNearbyShops] = useState([])
  const [nearbyNextCursor, setNearbyNextCursor] = useState(null)
  const [nearbyPrevCursor, setNearbyPrevCursor] = useState(null)
  const [nearbyHasNext, setNearbyHasNext] = useState(false)
  const [nearbyHasPrev, setNearbyHasPrev] = useState(false)
  const [nearbyLoading, setNearbyLoading] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [locationPermission, setLocationPermission] = useState("prompt") // "granted", "denied", "blocked", "prompt"
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

  const requestLocationPermission = () => {
    // Set to prompt state to show loading indicator
    setLocationPermission("prompt")

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
          setLocationPermission("granted")
        },
        (error) => {
          console.error("Error getting location:", error)
          // PERMISSION_DENIED = 1
          if (error.code === 1) {
            // Permission was denied
            setLocationPermission("blocked")
          } else {
            setLocationPermission("denied")
          }
        },
        { enableHighAccuracy: true }
      )
    } else {
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

      if (cursor) {
        if (direction === 'next') {
          url.searchParams.append('after', cursor);
        } else if (direction === 'prev') {
          url.searchParams.append('before', cursor);
        }
      }

      // Add keyword filter if it exists
      if (filters.keyword) {
        url.searchParams.append('keyword', filters.keyword);
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

      if (cursor) {
        if (direction === 'next') {
          url.searchParams.append('after', cursor);
        } else if (direction === 'prev') {
          url.searchParams.append('before', cursor);
        }
      }

      // Add keyword filter if it exists
      if (filters.keyword) {
        url.searchParams.append('keyword', filters.keyword);
      }

      const response = await fetch(url);
      const data = await response.json()
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

    // Set filters state with a new object to ensure React detects the change
    setFilters({ ...actualFilters })

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

      // Add keyword filter if it exists
      if (actualFilters.keyword) {
        url.searchParams.append('keyword', actualFilters.keyword);
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

      // Add keyword filter if it exists
      if (actualFilters.keyword) {
        url.searchParams.append('keyword', actualFilters.keyword);
      }

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
    <div>
      {/* Main navigation tabs */}
      <div className="border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab, index) => (
              <button
                key={tab.name}
                onClick={() => handleTabChange(index)}
                className={classNames(
                  tab.current
                    ? "border-brown-500 text-brown-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                  "whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium",
                )}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Controls bar - moved below tabs for better mobile experience */}
      {activeTab !== 2 && (
        <div className="mt-4">
          {/* View type and filter controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => setViewType("card")}
                className={`flex items-center px-3 py-1.5 text-sm ${viewType === "card"
                  ? "bg-brown-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Cards
              </button>
              <button
                onClick={() => setViewType("list")}
                className={`flex items-center px-3 py-1.5 text-sm ${viewType === "list"
                  ? "bg-brown-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                List
              </button>
            </div>

            {/* Filter button */}
            <button
              onClick={() => setIsFilterSidebarOpen(true)}
              className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium ${Object.keys(filters).length > 0
                ? "bg-brown-100 text-brown-700"
                : "text-gray-700 hover:text-brown-600"
                } rounded-md`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filter</span>
              {Object.keys(filters).length > 0 && (
                <span className="ml-1 bg-brown-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {Object.keys(filters).length}
                </span>
              )}
            </button>
          </div>

          {/* Distance selector in its own row - only show in Nearby tab */}
          {activeTab === 1 && locationPermission === "granted" && (
            <div className="mb-3">
              <DistanceSelector
                selectedDistance={selectedDistance}
                handleDistanceChange={handleDistanceChange}
                disabled={nearbyLoading && nearbyShops.length === 0}
              />
            </div>
          )}
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
      />

      {/* Overlay when sidebar is open */}
      {isFilterSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsFilterSidebarOpen(false)}
        />
      )}
    </div>
  )
}
