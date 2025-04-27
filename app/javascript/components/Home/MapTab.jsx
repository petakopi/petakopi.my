import React, { useState, useEffect, useRef } from "react"
import MapStyles from "./Map/MapStyles"
import { setupMapEventHandlers } from "./Map/MapEventHandler"
import { initializeMap, updateMapSource } from "./Map/MapInitializer"
import { fetchMapData } from "./Map/MapDataService"

export default function MapTab({
  userLocation,
  mapboxAccessToken = "pk.eyJ1IjoiYW1yZWV6IiwiYSI6ImNsMDN3bW5rZDBidGYzZHBpdmZjMDVpbzkifQ.F8fdxihnLv9ZTuDjufmICQ"
}) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapInitializing, setMapInitializing] = useState(true)
  const [currentZoom, setCurrentZoom] = useState(0)
  const [hasClusters, setHasClusters] = useState(false)
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch shops from the maps endpoint - only once
  useEffect(() => {
    const loadMapData = async () => {
      setLoading(true);

      const result = await fetchMapData(userLocation);

      if (result.success) {
        setShops(result.shops);
      } else {
        console.error('Failed to fetch map data:', result.error);
        setShops([]);
      }

      setLoading(false);
    };

    // Only fetch shops once when the component mounts or when userLocation changes
    loadMapData();
  }, [userLocation]); // Only re-fetch when userLocation changes

  // Initialize the map using our extracted function
  const initMapInstance = () => {
    if (!mapContainer.current) return;

    map.current = initializeMap({
      mapContainer,
      mapboxAccessToken,
      userLocation,
      setMapLoaded,
      setMapInitializing,
      setCurrentZoom,
      shops,
      setHasClusters,
      mapLoaded
    });
  };

  // Setup cluster check
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const { setupClusterCheck } = setupMapEventHandlers(
      map.current,
      shops,
      setHasClusters,
      mapLoaded
    );

    // Setup and get cleanup function
    const cleanup = setupClusterCheck();

    return cleanup;
  }, [mapLoaded]);

  useEffect(() => {
    initMapInstance();

    return () => {
      if (map.current) map.current.remove();
    };
  }, []);

  useEffect(() => {
    updateMapSource(map.current, shops);
  }, [shops, mapLoaded]);

  return (
    <div className="col-span-3 relative">
      <MapStyles />

      <div
        ref={mapContainer}
        className="w-full h-[600px] rounded-lg shadow-md"
      />

      {(loading || mapInitializing) && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex flex-col justify-center items-center rounded-lg z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brown-500 mb-4"></div>
          <p className="text-brown-700 font-medium">
            {mapInitializing ? 'Initializing map...' : 'Loading coffee shops...'}
          </p>
        </div>
      )}

      {shops.length === 0 && !loading && !mapInitializing && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white py-3 px-6 rounded-lg shadow-md z-10">
          <p className="text-gray-700 font-medium">No coffee shops found</p>
          <p className="text-gray-500 text-sm mt-1">Try searching in a different location</p>
        </div>
      )}
    </div>
  )
}
