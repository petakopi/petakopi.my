import React, { useState, useEffect, useRef, useCallback } from "react"
import SkeletonCard from "./SkeletonCard"

const initialTabs = [
  { name: "Everywhere", href: "#" },
  { name: "Nearby", href: "#" },
]

const distanceOptions = [
  { value: 5, label: "5km" },
  { value: 10, label: "10km" },
  { value: 20, label: "20km" },
  { value: 30, label: "30km" },
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
            <>
              {everywhereShops.map((coffee_shop, index) => {
                if (everywhereShops.length === index + 1) {
                  return (
                    <div
                      ref={lastEverywhereElementRef}
                      key={`${coffee_shop.slug}-${index}`}
                      id={`coffee-shop-${index}`}
                      className="mb-4 p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex flex-col h-full">
                        <div className="relative mb-3">
                          <img
                            src={coffee_shop.logo && coffee_shop.logo !== ""
                              ? coffee_shop.logo
                              : `https://placehold.co/600x400/brown/white?text=${encodeURIComponent(coffee_shop.name)}`}
                            alt={coffee_shop.name}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          {coffee_shop.district && (
                            <span className="absolute top-2 right-2 bg-white bg-opacity-90 text-xs px-2 py-1 rounded-full">
                              {coffee_shop.district}
                            </span>
                          )}
                        </div>

                        <div className="flex-grow">
                          <h3 className="font-medium text-lg">{coffee_shop.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {coffee_shop.state || 'Location not specified'}
                          </p>

                          {coffee_shop.links && coffee_shop.links.length > 0 && (
                            <div className="mt-3">
                              <div className="flex flex-wrap gap-2">
                                {coffee_shop.links.map((link, i) => (
                                  <a
                                    key={i}
                                    href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                                  >
                                    {link.name}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            <span>Updated: {new Date(coffee_shop.updated_at).toLocaleDateString()}</span>
                          </div>
                          <a
                            href={`/coffee_shops/${coffee_shop.slug}`}
                            className="text-xs bg-brown-500 text-white px-3 py-1.5 rounded hover:bg-brown-600"
                          >
                            View Details
                          </a>
                        </div>
                      </div>
                    </div>
                  )
                } else {
                  return (
                    <div
                      key={`${coffee_shop.slug}-${index}`}
                      id={`coffee-shop-${index}`}
                      className="mb-4 p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex flex-col h-full">
                        <div className="relative mb-3">
                          <img
                            src={coffee_shop.logo && coffee_shop.logo !== ""
                              ? coffee_shop.logo
                              : `https://placehold.co/600x400/brown/white?text=${encodeURIComponent(coffee_shop.name)}`}
                            alt={coffee_shop.name}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          {coffee_shop.district && (
                            <span className="absolute top-2 right-2 bg-white bg-opacity-90 text-xs px-2 py-1 rounded-full">
                              {coffee_shop.district}
                            </span>
                          )}
                        </div>

                        <div className="flex-grow">
                          <h3 className="font-medium text-lg">{coffee_shop.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {coffee_shop.state || 'Location not specified'}
                          </p>

                          {coffee_shop.links && coffee_shop.links.length > 0 && (
                            <div className="mt-3">
                              <div className="flex flex-wrap gap-2">
                                {coffee_shop.links.map((link, i) => (
                                  <a
                                    key={i}
                                    href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                                  >
                                    {link.name}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            <span>Updated: {new Date(coffee_shop.updated_at).toLocaleDateString()}</span>
                          </div>
                          <a
                            href={`/coffee_shops/${coffee_shop.slug}`}
                            className="text-xs bg-brown-500 text-white px-3 py-1.5 rounded hover:bg-brown-600"
                          >
                            View Details
                          </a>
                        </div>
                      </div>
                    </div>
                  )
                }
              })}

              {everywhereLoading && everywhereShops.length > 0 && (
                <div className="col-span-full flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brown-500"></div>
                </div>
              )}
              
              {everywhereLoading && everywhereShops.length === 0 && (
                <>
                  {[...Array(6)].map((_, index) => (
                    <SkeletonCard key={`skeleton-everywhere-${index}`} />
                  ))}
                </>
              )}

              {!everywhereHasMore && everywhereShops.length > 0 && (
                <div className="col-span-full">
                  <p className="text-gray-500 text-center py-4">No more coffee shops to load</p>
                </div>
              )}
            </>
          )}

          {activeTab === 1 && (
            <>
              {locationPermission === "denied" || locationPermission === "blocked" ? (
                <div className="col-span-full text-center py-8">
                  {locationPermission === "blocked" ? (
                    <>
                      <p className="text-gray-600 mb-4">
                        Location access is blocked. Please enable location permissions in your browser settings.
                      </p>
                      <div className="bg-gray-100 p-4 rounded-lg max-w-md mx-auto text-left mb-4">
                        <h4 className="font-medium mb-2">How to enable location:</h4>
                        <ul className="list-disc pl-5 text-sm text-gray-600">
                          <li>Click the lock/info icon in your browser's address bar</li>
                          <li>Find "Location" or "Site settings"</li>
                          <li>Change the permission to "Allow"</li>
                          <li>Refresh the page</li>
                        </ul>
                      </div>
                      <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-brown-500 text-white rounded hover:bg-brown-600"
                      >
                        Refresh Page
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-600 mb-4">No nearby coffee shops, please share your location</p>
                      <button 
                        onClick={requestLocationPermission}
                        className="px-4 py-2 bg-brown-500 text-white rounded hover:bg-brown-600"
                      >
                        Share Location
                      </button>
                    </>
                  )}
                </div>
              ) : nearbyLoading && nearbyShops.length === 0 ? (
                <>
                  <div className="col-span-full mb-4">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {distanceOptions.map((option) => (
                        <button
                          key={option.value}
                          disabled
                          className={`px-3 py-1 rounded-full text-sm ${
                            selectedDistance === option.value
                              ? "bg-brown-500 text-white"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {[...Array(6)].map((_, index) => (
                    <SkeletonCard key={`skeleton-nearby-${index}`} />
                  ))}
                </>
              ) : (
                <>
                  <div className="col-span-full mb-4">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {distanceOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleDistanceChange(option.value)}
                          className={`px-3 py-1 rounded-full text-sm ${selectedDistance === option.value
                              ? "bg-brown-500 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {nearbyShops.length > 0 ? (
                    nearbyShops.map((coffee_shop, index) => {
                      if (nearbyShops.length === index + 1) {
                        return (
                          <div
                            ref={lastNearbyElementRef}
                            key={`${coffee_shop.slug}-${index}`}
                            id={`nearby-shop-${index}`}
                            className="mb-4 p-3 border border-gray-200 rounded-lg"
                          >
                            <div className="flex flex-col h-full">
                              <div className="relative mb-3">
                                <img
                                  src={coffee_shop.logo && coffee_shop.logo !== ""
                                    ? coffee_shop.logo
                                    : `https://placehold.co/600x400/brown/white?text=${encodeURIComponent(coffee_shop.name)}`}
                                  alt={coffee_shop.name}
                                  className="w-full h-48 object-cover rounded-lg"
                                />
                                {coffee_shop.district && (
                                  <span className="absolute top-2 right-2 bg-white bg-opacity-90 text-xs px-2 py-1 rounded-full">
                                    {coffee_shop.district}
                                  </span>
                                )}
                              </div>

                              <div className="flex-grow">
                                <h3 className="font-medium text-lg">{coffee_shop.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {coffee_shop.state || 'Location not specified'}
                                </p>

                                {coffee_shop.links && coffee_shop.links.length > 0 && (
                                  <div className="mt-3">
                                    <div className="flex flex-wrap gap-2">
                                      {coffee_shop.links.map((link, i) => (
                                        <a
                                          key={i}
                                          href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                                        >
                                          {link.name}
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                                <div className="text-xs text-gray-500">
                                  <span>Updated: {new Date(coffee_shop.updated_at).toLocaleDateString()}</span>
                                </div>
                                <a
                                  href={`/coffee_shops/${coffee_shop.slug}`}
                                  className="text-xs bg-brown-500 text-white px-3 py-1.5 rounded hover:bg-brown-600"
                                >
                                  View Details
                                </a>
                              </div>
                            </div>
                          </div>
                        )
                      } else {
                        return (
                          <div
                            key={`${coffee_shop.slug}-${index}`}
                            id={`nearby-shop-${index}`}
                            className="mb-4 p-3 border border-gray-200 rounded-lg"
                          >
                            <div className="flex flex-col h-full">
                              <div className="relative mb-3">
                                <img
                                  src={coffee_shop.logo && coffee_shop.logo !== ""
                                    ? coffee_shop.logo
                                    : `https://placehold.co/600x400/brown/white?text=${encodeURIComponent(coffee_shop.name)}`}
                                  alt={coffee_shop.name}
                                  className="w-full h-48 object-cover rounded-lg"
                                />
                                {coffee_shop.district && (
                                  <span className="absolute top-2 right-2 bg-white bg-opacity-90 text-xs px-2 py-1 rounded-full">
                                    {coffee_shop.district}
                                  </span>
                                )}
                              </div>

                              <div className="flex-grow">
                                <h3 className="font-medium text-lg">{coffee_shop.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {coffee_shop.state || 'Location not specified'}
                                </p>

                                {coffee_shop.links && coffee_shop.links.length > 0 && (
                                  <div className="mt-3">
                                    <div className="flex flex-wrap gap-2">
                                      {coffee_shop.links.map((link, i) => (
                                        <a
                                          key={i}
                                          href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                                        >
                                          {link.name}
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                                <div className="text-xs text-gray-500">
                                  <span>Updated: {new Date(coffee_shop.updated_at).toLocaleDateString()}</span>
                                </div>
                                <a
                                  href={`/coffee_shops/${coffee_shop.slug}`}
                                  className="text-xs bg-brown-500 text-white px-3 py-1.5 rounded hover:bg-brown-600"
                                >
                                  View Details
                                </a>
                              </div>
                            </div>
                          </div>
                        )
                      }
                    })
                  ) : (
                    <div className="col-span-full">
                      <p className="text-gray-500 text-center py-4">No nearby coffee shops found</p>
                    </div>
                  )}


                  {nearbyLoading && nearbyShops.length > 0 && (
                    <div className="col-span-full flex justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brown-500"></div>
                    </div>
                  )}

                  {!nearbyHasMore && nearbyShops.length > 0 && (
                    <div className="col-span-full">
                      <p className="text-gray-500 text-center py-4">No more coffee shops to load</p>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
