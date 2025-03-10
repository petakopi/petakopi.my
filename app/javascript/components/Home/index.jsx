import React, { useState, useEffect } from "react"
import EverywhereTab from "./EverywhereTab"
import NearbyTab from "./NearbyTab"

const initialTabs = [
  { name: "Everywhere", href: "#" },
  { name: "Nearby", href: "#" },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

export default function Home() {
  const [tabs, setTabs] = useState(initialTabs.map((tab, index) => ({
    ...tab,
    current: index === 0
  })))

  const [activeTab, setActiveTab] = useState(0)

  // Everywhere tab state
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

  // Initial data loading for both tabs
  useEffect(() => {
    // Load everywhere data when component mounts
    if (everywhereShops.length === 0) {
      fetchEverywhereShops()
    }

    // Load nearby data when tab is active and we have location
    if (activeTab === 1) {
      if (locationPermission === "granted" && userLocation) {
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
      console.error('Error fetching everywhere coffee shops:', error)
      setEverywhereShops([])
      setEverywhereHasNext(false)
      setEverywhereHasPrev(false)
    } finally {
      setEverywhereLoading(false)
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
    return (
      <div className="flex justify-center mt-8 space-x-4">
        <button
          onClick={onPrev}
          disabled={!hasPrev || loading}
          className={`px-4 py-2 rounded ${
            hasPrev && !loading
              ? "bg-brown-500 text-white hover:bg-brown-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={!hasNext || loading}
          className={`px-4 py-2 rounded ${
            hasNext && !loading
              ? "bg-brown-500 text-white hover:bg-brown-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Next
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="border-b border-gray-200">
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

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 0 && (
            <EverywhereTab
              everywhereShops={everywhereShops}
              everywhereLoading={everywhereLoading}
            />
          )}

          {activeTab === 1 && (
            <NearbyTab
              nearbyShops={nearbyShops}
              nearbyLoading={nearbyLoading}
              locationPermission={locationPermission}
              requestLocationPermission={requestLocationPermission}
              selectedDistance={selectedDistance}
              handleDistanceChange={handleDistanceChange}
            />
          )}
        </div>
        
        {/* Pagination controls */}
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
    </div>
  )
}
