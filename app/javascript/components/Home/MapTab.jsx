import React, { useState, useEffect, useRef } from "react"
import MapStyles from "./Map/MapStyles"
import MapCardList from "./Map/MapCardList"
import { setupMapEventHandlers } from "./Map/MapEventHandler"
import { initializeMap, highlightShopOnMap, updateMapSource } from "./Map/MapInitializer"
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
  const [visibleShops, setVisibleShops] = useState([])
  const [selectedShopId, setSelectedShopId] = useState(null)
  const [highlightedShopId, setHighlightedShopId] = useState(null)
  const [hasClusters, setHasClusters] = useState(false)
  const highlightTimeoutRef = useRef(null)
  const markersRef = useRef([])
  const clustersRef = useRef(null)
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch shops from the maps endpoint - only once
  useEffect(() => {
    const loadMapData = async () => {
      setLoading(true);

      const result = await fetchMapData(userLocation);

      if (result.success) {
        setShops(result.shops);
        // Don't set visible shops here - we'll wait for the map to load and show markers first
        // setVisibleShops will be called after the map loads and markers are displayed
      } else {
        console.error('Failed to fetch map data:', result.error);
        setShops([]);
        setVisibleShops([]);
      }

      setLoading(false);
    };

    // Only fetch shops once when the component mounts or when userLocation changes
    loadMapData();
  }, [userLocation]); // Only re-fetch when userLocation changes

  // Debug useEffect to track visibleShops changes
  useEffect(() => {
    console.log("=== VISIBLE SHOPS CHANGED ===");
    console.log("visibleShops count:", visibleShops.length);
    if (visibleShops.length > 0) {
      console.log("First visible shop:", visibleShops[0]);
      console.log("Visible shop IDs:", visibleShops.map(shop => shop.id));
    }

    // Debug the displayShops calculation
    const displayShops = visibleShops.length > 0 ? visibleShops : shops.slice(0, 20);
    console.log("displayShops count:", displayShops.length);
    console.log("Are visibleShops being used for display?", visibleShops.length > 0);
  }, [visibleShops, shops]);

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
      setSelectedShopId,
      animateHighlightShop,
      shops,
      setVisibleShops,
      setHasClusters,
      mapLoaded
    });
  };

  // Set up force update handler for map interactions
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const { setupForceUpdateHandler } = setupMapEventHandlers(
      map.current,
      shops,
      setVisibleShops,
      setHasClusters,
      mapLoaded
    );

    // Setup and get cleanup function
    const cleanup = setupForceUpdateHandler();

    return cleanup;
  }, [mapLoaded, shops, visibleShops]);

  // Setup cluster check
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const { setupClusterCheck } = setupMapEventHandlers(
      map.current,
      shops,
      setVisibleShops,
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
      clearMarkers();
    };
  }, []);

  useEffect(() => {
    updateMapSource(map.current, shops);
  }, [shops, mapLoaded]);

  // Use a more efficient way to force re-renders when needed
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0);

  useEffect(() => {
    // Force a re-render of the component when visibleShops changes
    if (visibleShops.length > 0) {
      console.log("=== FORCING COMPONENT UPDATE ===");
      // Use a dedicated counter for forcing re-renders instead of changing zoom
      setForceUpdateCounter(prev => prev + 1);
    }
  }, [visibleShops]);

  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []
  }

  // Function to highlight a shop on the map
  const highlightShop = (shopId) => {
    setSelectedShopId(shopId);
    highlightShopOnMap(map.current, shopId);
  }

  // Function to temporarily highlight a shop card with animation
  const animateHighlightShop = (shopId) => {
    // Clear any existing timeout
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }

    // Set the highlighted shop
    setHighlightedShopId(shopId);

    // Find and scroll to the card
    setTimeout(() => {
      const cardElement = document.getElementById(`shop-${shopId}`);
      if (cardElement) {
        // Scroll the cards container to show the highlighted card
        const cardsContainer = document.getElementById('map-cards-container');
        if (cardsContainer) {
          cardsContainer.scrollLeft = cardElement.offsetLeft - (cardsContainer.offsetWidth / 2) + (cardElement.offsetWidth / 2);
        }
      }
    }, 100);

    // Clear the highlight after 3 seconds
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedShopId(null);
    }, 3000);
  }

  // Handle card click
  const handleCardClick = (shop) => {
    highlightShop(shop.id);
    window.location.href = `/coffee_shops/${shop.slug}`;
  };

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log("=== DEBUG INFO ===");
      console.log("Clusters:", hasClusters ? 'Yes' : 'No');
      console.log("Visible shops:", visibleShops.length);
    }
  }, [hasClusters, visibleShops.length])

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

      {visibleShops.length > 0 && (
        <MapCardList
          visibleShops={visibleShops}
          selectedShopId={selectedShopId}
          highlightedShopId={highlightedShopId}
          onCardClick={handleCardClick}
          hasClusters={hasClusters}
        />
      )}
    </div>
  )
}
