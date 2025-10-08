import React, { useState, useEffect } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import ExploreTab from "./ExploreTab"
import MapTab from "./MapTab"
import FilterSidebar from "./FilterSidebar"
import FilterPills from "./FilterPills"
import LocationRequiredPrompt from "./LocationRequiredPrompt"
import LocationBlockedPrompt from "./LocationBlockedPrompt"
import LocationRefreshPrompt from "./LocationRefreshPrompt"
import ControlsBar from "./ControlsBar"
import AppBanner from "./AppBanner"
import ReactQueryDevtools from "../ReactQueryDevtools"
import { QueryErrorBoundary, QueryError } from "../ErrorBoundary"
import "mapbox-gl/dist/mapbox-gl.css"
import { queryClient } from "../../lib/queryClient"
import {
  useCoffeeShops,
  usePrefetchCoffeeShops,
} from "../../hooks/useCoffeeShops"
import { useStates } from "../../hooks/useFilters"
import { queryKeys } from "../../lib/queryKeys"

// Geolocation configuration
const GEOLOCATION_CONFIG = {
  TIMEOUT_DURATION: 30000, // Increase to 30 seconds for our custom timeout
  API_TIMEOUT: 20000, // Increase to 20 seconds for the geolocation API timeout
  CACHE_DURATION: 5 * 60 * 1000, // Reduce cache duration to 5 minutes to get fresher locations
  HIGH_ACCURACY: false, // Set to false to allow less accurate but faster results
}

const initialTabs = [
  { name: "Explore", href: "#" },
  { name: "Map", href: "#" },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

// Helper function to check if distance value is valid for API requests
function isValidDistance(distance) {
  const isValid =
    distance !== null &&
    distance !== undefined &&
    distance !== 0 &&
    !isNaN(distance) &&
    distance > 0

  // Debug logging to catch any invalid distance values
  if (!isValid && distance !== null && distance !== undefined) {
    console.warn("Invalid distance value detected:", distance, typeof distance)
  }

  return isValid
}

function HomeContent({
  initialFilters = {},
  initialViewType = "card",
  initialActiveTab = 0,
  collections = [],
}) {
  const [tabs, setTabs] = useState(() => {
    // Try to get the saved tab index from localStorage
    const savedTabIndex = localStorage.getItem("petakopi_active_tab")
    const activeIndex = savedTabIndex !== null ? parseInt(savedTabIndex, 10) : 0

    return initialTabs.map((tab, index) => ({
      ...tab,
      current: index === activeIndex,
    }))
  })

  const [activeTab, setActiveTab] = useState(() => {
    // Try to get the saved tab index from localStorage
    const savedTabIndex = localStorage.getItem("petakopi_active_tab")
    return savedTabIndex !== null ? parseInt(savedTabIndex, 10) : 0
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)

  // Location state
  const [userLocation, setUserLocation] = useState(null)
  const [locationPermission, setLocationPermission] = useState("")
  const [selectedDistance, setSelectedDistance] = useState(5)

  // Filter sidebar state
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false)
  const [listFilters, setListFilters] = useState({})
  const [mapFilters, setMapFilters] = useState({})

  // Helper function to get current filters based on active tab
  const getCurrentFilters = () => (activeTab === 0 ? listFilters : mapFilters)
  const setCurrentFilters = (filters) =>
    activeTab === 0 ? setListFilters(filters) : setMapFilters(filters)

  // View type state (card or list)
  const [viewType, setViewType] = useState(() => {
    // Try to get the saved view type from localStorage
    const savedViewType = localStorage.getItem("petakopi_view_type")
    return savedViewType || "card" // Default to card view if not found
  })

  const [showLocationPrompt, setShowLocationPrompt] = useState(false)
  const [showLocationBlockedPrompt, setShowLocationBlockedPrompt] =
    useState(false)
  const [showLocationRefreshPrompt, setShowLocationRefreshPrompt] =
    useState(false)

  // Helper function to add filters to URL
  const applyFiltersToUrl = (url, filters) => {
    // Add keyword filter if it exists (only for list view)
    if (activeTab === 0 && filters.keyword) {
      url.searchParams.append("keyword", filters.keyword)
    }

    // Add tags filter if it exists (multiple tags)
    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach((tag) => {
        url.searchParams.append("tags[]", tag)
      })
    }

    // Add state filter if it exists (only for list view)
    if (activeTab === 0 && filters.state) {
      url.searchParams.append("state", filters.state)
    }

    // Add district filter if it exists (only for list view)
    if (activeTab === 0 && filters.district) {
      url.searchParams.append("district", filters.district)
    }

    // Add collection filter if it exists
    if (filters.collection_id) {
      url.searchParams.append("collection_id", filters.collection_id)
    }

    // Add opened filter if it exists
    if (filters.opened) {
      url.searchParams.append("opened", filters.opened)
    }

    // Add rating filter if it exists
    if (filters.rating) {
      url.searchParams.append("rating", filters.rating)
    }

    // Add rating count filter if it exists
    if (filters.rating_count) {
      url.searchParams.append("rating_count", filters.rating_count)
    }

    return url
  }

  // Add initial location permission check
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((permissionStatus) => {
          if (permissionStatus.state === "granted") {
            setLocationPermission("granted")
            requestLocationPermission()
          } else if (permissionStatus.state === "denied") {
            setLocationPermission("denied")
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
            longitude: position.coords.longitude,
          }
          console.log("New location received:", newLocation)
          setUserLocation(newLocation)
          setLocationPermission("granted")
        },
        (error) => {
          clearTimeout(locationTimeout) // Clear the timeout on error
          console.error("Error getting location:", error)
          // PERMISSION_DENIED = 1, POSITION_UNAVAILABLE = 2, TIMEOUT = 3
          switch (error.code) {
            case 1:
              setLocationPermission("denied")
              setShowLocationBlockedPrompt(true)
              break
            case 2:
              // For POSITION_UNAVAILABLE, try again with lower accuracy
              console.log(
                "Position unavailable, retrying with lower accuracy..."
              )
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const newLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                  }
                  console.log(
                    "New location received with lower accuracy:",
                    newLocation
                  )
                  setUserLocation(newLocation)
                  setLocationPermission("granted")
                },
                (retryError) => {
                  console.error("Error getting location on retry:", retryError)
                  setLocationPermission("denied")
                },
                {
                  enableHighAccuracy: false,
                  timeout: GEOLOCATION_CONFIG.API_TIMEOUT,
                  maximumAge: GEOLOCATION_CONFIG.CACHE_DURATION,
                }
              )
              break
            case 3:
              setLocationPermission("timeout")
              break
            default:
              setLocationPermission("denied")
          }
        },
        {
          enableHighAccuracy: GEOLOCATION_CONFIG.HIGH_ACCURACY,
          timeout: GEOLOCATION_CONFIG.API_TIMEOUT,
          maximumAge: GEOLOCATION_CONFIG.CACHE_DURATION,
        }
      )
    } else {
      clearTimeout(locationTimeout) // Clear the timeout if geolocation is not supported
      console.error("Geolocation is not supported by this browser")
      setLocationPermission("denied")
    }
  }

  // Prefetch hook for better UX
  const prefetchCoffeeShops = usePrefetchCoffeeShops()

  const handleApplyFilters = (newFilters) => {
    // Remove the timestamp if it exists (used just to force updates)
    const { _timestamp, ...actualFilters } = newFilters

    // Check if distance filter is selected but location is not available
    if (
      actualFilters.distance &&
      !userLocation &&
      locationPermission !== "granted"
    ) {
      setShowLocationPrompt(true)
      return
    }

    // Invalidate all coffee shop queries to force fresh data
    queryClient.invalidateQueries({
      queryKey: queryKeys.coffeeShopsList(),
    })

    // Set filters state with a new object to ensure React detects the change
    setCurrentFilters({ ...actualFilters })

    // Reset to first page when filters change
    setCurrentPage(1)
  }

  const handleNextPage = () => {
    if (
      activeTab === 0 &&
      !everywhereLoading &&
      everywhereCurrentPage < everywhereTotalPages
    ) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const handlePrevPage = () => {
    if (activeTab === 0 && !everywhereLoading && everywhereCurrentPage > 1) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  const handleTabChange = (index) => {
    setActiveTab(index)
    setTabs(
      tabs.map((tab, i) => ({
        ...tab,
        current: i === index,
      }))
    )

    // Save the active tab index to localStorage
    localStorage.setItem("petakopi_active_tab", index.toString())
  }

  const handleDistanceChange = (distance) => {
    setSelectedDistance(distance)
    // React Query will automatically refetch when distance filter changes
  }

  const handleLocationRequest = () => {
    setShowLocationPrompt(false)
    requestLocationPermission()
  }

  const handleLocationPillClick = () => {
    if (locationPermission === "granted") {
      if (userLocation) {
        // If we already have location, just show the refresh prompt
        setShowLocationRefreshPrompt(true)
      } else {
        // If we have permission but no location, request it
        requestLocationPermission()
      }
    } else {
      // If we don't have permission, request it
      requestLocationPermission()
    }
  }

  const handleLocationRefresh = () => {
    setShowLocationRefreshPrompt(false)
    // Set loading state immediately
    setLocationPermission("prompt")
    // Clear current location
    setUserLocation(null)
    // Request new location
    requestLocationPermission()
  }

  // Pagination component
  const Pagination = ({ currentPage, totalPages, onNext, onPrev, loading }) => {
    const handleNext = (e) => {
      e.preventDefault()
      if (currentPage < totalPages && !loading) {
        onNext()
        // Scroll to top after data loads
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" })
        }, 100)
      }
    }

    const handlePrev = (e) => {
      e.preventDefault()
      if (currentPage > 1 && !loading) {
        onPrev()
        // Scroll to top after data loads
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" })
        }, 100)
      }
    }

    return (
      <div className="py-3 px-4 mb-20 md:mb-0 flex justify-between items-center">
        <div className="text-sm text-gray-700">
          {loading ? (
            <span>Loading...</span>
          ) : (
            <span>
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>
        <nav className="pagy-nav pagination" role="navigation">
          <span
            className={`page prev ${currentPage <= 1 || loading ? "disabled" : ""}`}
          >
            <a
              href="#"
              onClick={handlePrev}
              className={
                currentPage <= 1 || loading
                  ? "cursor-not-allowed opacity-50"
                  : "hover:text-brown-600"
              }
            >
              Prev
            </a>
          </span>

          <span
            className={`page next ${currentPage >= totalPages || loading ? "disabled" : ""}`}
          >
            <a
              href="#"
              onClick={handleNext}
              className={
                currentPage >= totalPages || loading
                  ? "cursor-not-allowed opacity-50"
                  : "hover:text-brown-600"
              }
            >
              Next
            </a>
          </span>
        </nav>
      </div>
    )
  }

  // Add effect to save view type when it changes
  useEffect(() => {
    localStorage.setItem("petakopi_view_type", viewType)
  }, [viewType])

  // Add effect to control body scrolling when sidebar is open
  useEffect(() => {
    if (isFilterSidebarOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isFilterSidebarOpen])

  // Filter data with React Query
  const {
    data: states = [],
    isLoading: isLoadingStates,
    error: statesError,
  } = useStates()
  const stateError = statesError
    ? "Failed to load states. Please try again later."
    : null

  // Get current filters and prepare query parameters
  const currentFilters = getCurrentFilters()

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [currentFilters, activeTab])

  // Prepare filters with location data
  const filtersWithLocation = {
    ...currentFilters,
    lat: userLocation?.latitude,
    lng: userLocation?.longitude,
  }

  // Coffee shops query with improved React Query implementation
  const {
    data: coffeeShopsData,
    isLoading: isLoadingCoffeeShops,
    error: coffeeShopsError,
    isPlaceholderData,
    refetch: refetchCoffeeShops,
  } = useCoffeeShops(filtersWithLocation, {
    page: currentPage,
    enabled: activeTab === 0, // Only fetch for explore tab
  })

  // Extract data from React Query response
  const everywhereShops = coffeeShopsData?.coffee_shops || []
  const everywhereCurrentPage =
    coffeeShopsData?.pages?.current_page || currentPage
  const everywhereTotalPages = coffeeShopsData?.pages?.total_pages || 1
  const everywhereTotalCount = coffeeShopsData?.pages?.total_count || 0
  const everywhereLoading = isLoadingCoffeeShops

  // Show error state if there's an error fetching coffee shops
  const showErrorState = coffeeShopsError && !isLoadingCoffeeShops

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
          collections={collections}
        />
      )}

      {/* App Banner - show only in explore view */}
      {activeTab === 0 && <AppBanner />}

      {/* Main content area */}
      <div
        className={`${activeTab === 1 ? "h-[calc(100vh-4rem)]" : ""} bg-gray-50 rounded-lg relative`}
      >
        {/* ExploreTab */}
        <div style={{ display: activeTab === 0 ? "block" : "none" }}>
          {showErrorState ? (
            <QueryError
              error={coffeeShopsError}
              retry={refetchCoffeeShops}
              className="m-8"
            />
          ) : (
            <>
              <ExploreTab
                everywhereShops={everywhereShops}
                everywhereLoading={everywhereLoading}
                viewType={viewType}
                userLocation={userLocation}
              />
              {everywhereTotalPages > 1 && (
                <Pagination
                  currentPage={everywhereCurrentPage}
                  totalPages={everywhereTotalPages}
                  onNext={handleNextPage}
                  onPrev={handlePrevPage}
                  loading={everywhereLoading}
                />
              )}
            </>
          )}
        </div>
        {/* MapTab */}
        <div
          style={{
            display: activeTab === 1 ? "block" : "none",
            position: "relative",
            height: "calc(100vh - 4.5rem)",
            width: "100%",
            margin: 0,
            padding: 0,
            zIndex: 0,
          }}
        >
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
          className="fixed bottom-6 right-6 bg-brown-600 text-white px-6 py-4 rounded-full shadow-lg hover:bg-brown-700 transition-colors flex items-center space-x-3 z-50 text-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <span>Map</span>
        </button>
      )}

      {/* Floating List button - only show when in map view */}
      {activeTab === 1 && (
        <button
          onClick={() => handleTabChange(0)}
          className="fixed bottom-6 right-6 bg-brown-600 text-white px-6 py-4 rounded-full shadow-lg hover:bg-brown-700 transition-colors flex items-center space-x-3 z-50 text-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
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
        states={states}
        isLoadingStates={isLoadingStates}
        stateError={stateError}
        collections={collections}
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

export default function Home(props) {
  return (
    <QueryClientProvider client={queryClient}>
      <QueryErrorBoundary>
        <HomeContent {...props} />
      </QueryErrorBoundary>
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}
