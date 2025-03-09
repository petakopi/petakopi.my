import React, { useState, useEffect, useRef, useCallback } from "react"
import EverywhereTab from "./EverywhereTab"
import NearbyTab from "./NearbyTab"

const initialTabs = [
  { name: "Everywhere", href: "#" },
  { name: "Nearby", href: "#" },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

export default function Home({ coffee_shops, pagination }) {
  const [tabs, setTabs] = useState(initialTabs.map((tab, index) => ({
    ...tab,
    current: index === 0
  })))

  const [activeTab, setActiveTab] = useState(0)

  // Everywhere tab state
  const [everywhereShops, setEverywhereShops] = useState(coffee_shops || [])
  const [everywhereNextCursor, setEverywhereNextCursor] = useState(pagination?.next_cursor || null)
  const [everywhereHasMore, setEverywhereHasMore] = useState(pagination?.has_next || false)
  const [everywhereLoading, setEverywhereLoading] = useState(false)

  // Nearby tab state
  const [nearbyShops, setNearbyShops] = useState([])
  const [nearbyNextCursor, setNearbyNextCursor] = useState(null)
  const [nearbyHasMore, setNearbyHasMore] = useState(true)
  const [nearbyLoading, setNearbyLoading] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [locationPermission, setLocationPermission] = useState("prompt") // "granted", "denied", "blocked", "prompt"
  const [selectedDistance, setSelectedDistance] = useState(10) // Default to 10km

  // Refs for intersection observer
  const everywhereObserver = useRef()
  const nearbyObserver = useRef()

  // Last element refs
  const lastEverywhereElementRef = useCallback(node => {
    if (everywhereLoading) return
    if (everywhereObserver.current) everywhereObserver.current.disconnect()

    everywhereObserver.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && everywhereHasMore) {
        fetchMoreEverywhereShops()
      }
    })

    if (node) everywhereObserver.current.observe(node)
  }, [everywhereLoading, everywhereHasMore])

  const lastNearbyElementRef = useCallback(node => {
    if (nearbyLoading) return
    if (nearbyObserver.current) nearbyObserver.current.disconnect()

    nearbyObserver.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && nearbyHasMore) {
        fetchMoreNearbyShops()
      }
    })

    if (node) nearbyObserver.current.observe(node)
  }, [nearbyLoading, nearbyHasMore])

  useEffect(() => {
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

  const fetchNearbyShops = async () => {
    if (!userLocation) return;

    setNearbyLoading(true)
    try {
      const url = new URL('/api/v1/coffee_shops', window.location.origin);
      url.searchParams.append('lat', userLocation.latitude);
      url.searchParams.append('lng', userLocation.longitude);
      url.searchParams.append('distance', selectedDistance);

      const response = await fetch(url);
      const data = await response.json();
      if (data.status === "success" && data.data && data.data.coffee_shops) {
        setNearbyShops(data.data.coffee_shops)
        setNearbyNextCursor(data.data.pages.next_cursor)
        setNearbyHasMore(data.data.pages.has_next)
      } else {
        console.error('Unexpected response format:', data)
        setNearbyShops([])
        setNearbyHasMore(false)
      }
    } catch (error) {
      console.error('Error fetching nearby coffee shops:', error)
      setNearbyShops([])
      setNearbyHasMore(false)
    } finally {
      setNearbyLoading(false)
    }
  }

  const fetchMoreNearbyShops = async () => {
    if (!nearbyNextCursor || !nearbyHasMore || nearbyLoading || !userLocation) return

    setNearbyLoading(true)
    try {
      const url = new URL('/api/v1/coffee_shops', window.location.origin);
      url.searchParams.append('lat', userLocation.latitude);
      url.searchParams.append('lng', userLocation.longitude);
      url.searchParams.append('distance', selectedDistance);
      url.searchParams.append('after', nearbyNextCursor);

      const response = await fetch(url);
      const data = await response.json()
      if (data.status === "success" && data.data && data.data.coffee_shops) {
        setNearbyShops(prev => [...prev, ...data.data.coffee_shops])
        setNearbyNextCursor(data.data.pages.next_cursor)
        setNearbyHasMore(data.data.pages.has_next)
      } else {
        setNearbyHasMore(false)
      }
    } catch (error) {
      console.error('Error fetching more nearby coffee shops:', error)
      setNearbyHasMore(false)
    } finally {
      setNearbyLoading(false)
    }
  }

  const fetchMoreEverywhereShops = async () => {
    if (!everywhereNextCursor || !everywhereHasMore || everywhereLoading) return

    setEverywhereLoading(true)
    try {
      const response = await fetch(`/api/v1/coffee_shops?after=${everywhereNextCursor}`)
      const data = await response.json()
      if (data.status === "success" && data.data && data.data.coffee_shops) {
        setEverywhereShops(prev => [...prev, ...data.data.coffee_shops])
        setEverywhereNextCursor(data.data.pages.next_cursor)
        setEverywhereHasMore(data.data.pages.has_next)
      } else {
        setEverywhereHasMore(false)
      }
    } catch (error) {
      console.error('Error fetching more everywhere coffee shops:', error)
      setEverywhereHasMore(false)
    } finally {
      setEverywhereLoading(false)
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
      setNearbyHasMore(true)
      setNearbyLoading(true)
      fetchNearbyShops()
    }
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
              everywhereHasMore={everywhereHasMore}
              lastEverywhereElementRef={lastEverywhereElementRef}
            />
          )}

          {activeTab === 1 && (
            <NearbyTab 
              nearbyShops={nearbyShops}
              nearbyLoading={nearbyLoading}
              nearbyHasMore={nearbyHasMore}
              lastNearbyElementRef={lastNearbyElementRef}
              locationPermission={locationPermission}
              requestLocationPermission={requestLocationPermission}
              selectedDistance={selectedDistance}
              handleDistanceChange={handleDistanceChange}
            />
          )}
        </div>
      </div>
    </div>
  )
}
