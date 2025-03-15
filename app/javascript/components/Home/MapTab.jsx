import React, { useState, useEffect, useRef } from "react"
import mapboxgl from "mapbox-gl"
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder"
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css"
import "mapbox-gl/dist/mapbox-gl.css"
import MapStyles from "./Map/MapStyles"
import MapCardList from "./Map/MapCardList"

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
    const fetchShops = async () => {
      setLoading(true)
      try {
        const url = new URL('/api/v1/maps', window.location.origin);

        // Add user location if available
        if (userLocation) {
          url.searchParams.append('lat', userLocation.latitude);
          url.searchParams.append('lng', userLocation.longitude);
        }

        console.log("Fetching shops for map from:", url.toString());
        const response = await fetch(url);
        const data = await response.json();
        console.log("API Response:", data);

        if (data && data.status === "success" && data.data && Array.isArray(data.data.coffee_shops)) {
          // Nested structure with status and data
          const fetchedShops = data.data.coffee_shops;
          console.log("Received shops:", fetchedShops.length);
          setShops(fetchedShops);

          // Don't set visible shops here - we'll wait for the map to load and show markers first
          // setVisibleShops will be called after the map loads and markers are displayed
        } else {
          console.error('Unexpected response format:', data);
          setShops([]);
          setVisibleShops([]);
        }
      } catch (error) {
        console.error('Error fetching shops for map:', error);
        setShops([]);
        setVisibleShops([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch shops once when the component mounts or when userLocation changes
    fetchShops();
  }, [userLocation]); // Only re-fetch when userLocation changes

  // We'll remove this effect since we only want to show cards after markers are displayed
  // The visible shops will be set by the map's 'sourcedata' event handler

  // Force update visible shops when map is interacted with
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Debounce function to prevent too many updates
    let updateTimeout = null;

    // Add a handler to force update visible shops
    const forceUpdateHandler = () => {
      // Clear any existing timeout
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }

      // Set a new timeout to update after a delay
      updateTimeout = setTimeout(() => {
        if (map.current) {
          console.log("=== FORCE UPDATE VISIBLE SHOPS ===");
          // Get unclustered points
          const features = map.current.queryRenderedFeatures({ layers: ['unclustered-point'] });
          console.log("Force update: unclustered features found:", features.length);

          if (features.length > 0) {
            const updatedVisibleShops = features.map(feature => {
              const props = feature.properties;
              const id = typeof props.id === 'string' ? parseInt(props.id, 10) : props.id;
              return shops.find(shop => shop.id === id);
            })
              .filter(Boolean)
              .slice(0, 20);

            if (updatedVisibleShops.length > 0) {
              console.log("Force updating visible shops:", updatedVisibleShops.length);

              // Compare with current visible shops to avoid unnecessary updates
              const currentIds = visibleShops.map(shop => shop.id).sort().join(',');
              const newIds = updatedVisibleShops.map(shop => shop.id).sort().join(',');

              if (currentIds !== newIds) {
                setVisibleShops([...updatedVisibleShops]);
              } else {
                console.log("Skipping update - same shops already visible");
              }
            }
          }
        }
      }, 300); // Longer delay to prevent rapid updates
    };

    // Add event listeners for map interaction
    map.current.on('dragend', forceUpdateHandler);
    map.current.on('zoomend', forceUpdateHandler);
    map.current.on('click', forceUpdateHandler);

    return () => {
      if (map.current) {
        map.current.off('dragend', forceUpdateHandler);
        map.current.off('zoomend', forceUpdateHandler);
        map.current.off('click', forceUpdateHandler);
      }
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
    };
  }, [mapLoaded, shops, visibleShops]);

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

  useEffect(() => {
    if (!mapContainer.current) return

    mapboxgl.accessToken = mapboxAccessToken

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: userLocation
        ? [userLocation.longitude, userLocation.latitude]
        : [-74.5, 40], // Default to US view if no user location
      zoom: userLocation ? 12 : 3,
      attributionControl: false
    })

    map.current.addControl(new mapboxgl.AttributionControl(), 'bottom-left')

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right')

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxAccessToken,
      mapboxgl: mapboxgl,
      marker: false,
      placeholder: 'Search for a location',
      proximity: userLocation ? { longitude: userLocation.longitude, latitude: userLocation.latitude } : undefined
    })
    map.current.addControl(geocoder, 'top-left')

    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      }),
      'top-right'
    )

    map.current.on('zoomend', () => {
      const zoom = map.current.getZoom();
      console.log("Zoom changed to:", zoom);
      setCurrentZoom(zoom);
      // Note: The actual update of visible shops is now handled by the combined handler
    });

    map.current.on('load', () => {
      console.log("=== MAP LOADED ===");
      setMapLoaded(true);
      setMapInitializing(false);
      setCurrentZoom(map.current.getZoom());

      // Add the coffee shops source - start with empty features
      map.current.addSource('coffee-shops', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      })

      map.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'coffee-shops',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#6B4F4F',
            10, '#5D4037',
            25, '#4E342E'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            10, 30,
            25, 40
          ]
        }
      })

      map.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'coffee-shops',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        },
        paint: {
          'text-color': '#ffffff'
        }
      })

      map.current.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'coffee-shops',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'case',
            ['==', ['get', 'id'], ['to-number', ['get', 'selected_id'], -1]],
            '#FF6B4F', // Highlighted color
            '#6B4F4F'  // Default color
          ],
          'circle-radius': [
            'case',
            ['==', ['get', 'id'], ['to-number', ['get', 'selected_id'], -1]],
            9, // Larger radius for selected
            6  // Default radius
          ],
          'circle-stroke-width': [
            'case',
            ['==', ['get', 'id'], ['to-number', ['get', 'selected_id'], -1]],
            3, // Thicker stroke for selected
            2  // Default stroke width
          ],
          'circle-stroke-color': '#ffffff'
        }
      })

      map.current.on('click', 'clusters', (e) => {
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        })
        const clusterId = features[0].properties.cluster_id
        map.current.getSource('coffee-shops').getClusterExpansionZoom(
          clusterId,
          (err, zoom) => {
            if (err) return

            map.current.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom
            })
          }
        )
      })

      map.current.on('click', 'unclustered-point', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const { id } = e.features[0].properties;

        // Convert id to number if it's a string
        const shopId = typeof id === 'string' ? parseInt(id, 10) : id;

        // First fly to the location
        map.current.flyTo({
          center: coordinates,
          zoom: Math.max(map.current.getZoom(), 14),
          essential: true
        });

        // Wait for the map to finish flying before highlighting
        setTimeout(() => {
          // Set the selected shop (for the ring)
          setSelectedShopId(shopId);

          // Animate highlight the shop card
          animateHighlightShop(shopId);
        }, 1000);
      });

      map.current.on('mouseenter', 'clusters', () => {
        map.current.getCanvas().style.cursor = 'pointer'
      })
      map.current.on('mouseleave', 'clusters', () => {
        map.current.getCanvas().style.cursor = ''
      })
      map.current.on('mouseenter', 'unclustered-point', () => {
        map.current.getCanvas().style.cursor = 'pointer'
      })
      map.current.on('mouseleave', 'unclustered-point', () => {
        map.current.getCanvas().style.cursor = ''
      })

      // Combined handler for both moveend and zoomend events
      const updateVisibleShops = () => {
        console.log("=== MAP VIEW CHANGED ===");

        if (!map.current || !mapLoaded) {
          console.log("Map not ready for querying features");
          return;
        }

        try {
          // Get the current map bounds
          const bounds = map.current.getBounds();
          console.log("Current map bounds:", bounds.toArray());

          // Get the current zoom level
          const zoom = map.current.getZoom();
          console.log("Current zoom level:", zoom);

          // First check for unclustered points (individual markers)
          const visibleMarkers = map.current.queryRenderedFeatures({
            layers: ['unclustered-point']
          });
          console.log("Visible unclustered markers:", visibleMarkers.length);

          // Then check for clusters
          const visibleClusters = map.current.queryRenderedFeatures({
            layers: ['clusters']
          });
          console.log("Visible clusters:", visibleClusters.length);

          // Update clusters state - force to true for testing
          setHasClusters(visibleClusters.length > 0);
          console.log("Setting hasClusters to:", visibleClusters.length > 0);

          // If we have visible unclustered markers, use those directly
          if (visibleMarkers.length > 0) {
            // Extract shop IDs from markers
            const visibleShopIds = visibleMarkers.map(marker => {
              const id = marker.properties.id;
              return typeof id === 'string' ? parseInt(id, 10) : id;
            });

            console.log("Visible shop IDs from markers:", visibleShopIds);

            // Find matching shops from our shops array
            const matchingShops = shops.filter(shop =>
              visibleShopIds.includes(shop.id)
            ).slice(0, 20); // Limit to 20

            console.log("Setting visible shops from markers:", matchingShops.length);

            // Important: Create a new array to ensure React detects the change
            setVisibleShops([...matchingShops]);
            return;
          }

          // If we have clusters but no individual markers, we need to get shops from the clusters
          if (visibleClusters.length > 0 && visibleMarkers.length === 0) {
            // We'll use the bounds approach since we can't directly access cluster contents
            // This is a fallback when we only have clusters visible
            console.log("Only clusters visible, using bounds approach");
          }

          // Fallback: Manually check which shops are within the current bounds
          const visibleShopsInBounds = shops.filter(shop => {
            if (!shop.lat || !shop.lng) return false;

            const lat = parseFloat(shop.lat);
            const lng = parseFloat(shop.lng);

            // Check if the shop coordinates are within the current map bounds
            return lat >= bounds.getSouth() &&
              lat <= bounds.getNorth() &&
              lng >= bounds.getWest() &&
              lng <= bounds.getEast();
          });

          console.log("Shops in bounds (fallback):", visibleShopsInBounds.length);

          if (visibleShopsInBounds.length === 0) {
            console.log("No shops in bounds, clearing visible shops");
            setVisibleShops([]);
            return;
          }

          // Sort shops by distance from center if we have user location
          let sortedShops = [...visibleShopsInBounds];
          const mapCenter = map.current.getCenter();
          sortedShops.sort((a, b) => {
            // Calculate distance from map center
            const distA = Math.sqrt(
              Math.pow(parseFloat(a.lat) - mapCenter.lat, 2) +
              Math.pow(parseFloat(a.lng) - mapCenter.lng, 2)
            );
            const distB = Math.sqrt(
              Math.pow(parseFloat(b.lat) - mapCenter.lat, 2) +
              Math.pow(parseFloat(b.lng) - mapCenter.lng, 2)
            );
            return distA - distB;
          });

          // Limit to 20 shops
          const limitedShops = sortedShops.slice(0, 20);

          console.log("Setting visible shops (fallback):", limitedShops.length);

          // Important: Create a new array to ensure React detects the change
          setVisibleShops([...limitedShops]);
        } catch (error) {
          console.error("Error detecting visible shops:", error);
        }
      };

      // Add event listeners for both moveend and zoomend
      map.current.on('moveend', updateVisibleShops);
      map.current.on('zoomend', updateVisibleShops);

      // Add listener for source data loading - this is when we'll first show the cards
      map.current.on('sourcedata', (e) => {
        if (e.sourceId === 'coffee-shops' && map.current.isSourceLoaded('coffee-shops')) {
          console.log("Source data loaded, updating visible shops");

          // Only update if we don't already have visible shops
          if (visibleShops.length === 0) {
            console.log("First time source data loaded, setting initial visible shops");
            updateVisibleShops();
          } else {
            console.log("Source data loaded but we already have visible shops");
          }
        }
      });
    })

    return () => {
      if (map.current) map.current.remove()
      clearMarkers()
    }
  }, [])

  useEffect(() => {
    if (!map.current || !mapLoaded || !map.current.getSource('coffee-shops') || shops.length === 0) {
      console.log("Cannot update GeoJSON data: map or shops not ready");
      return;
    }

    console.log("=== UPDATING GEOJSON DATA SOURCE ===");
    console.log("Updating GeoJSON with shops:", shops.length);

    // Create GeoJSON features from shops
    const features = shops.map(shop => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [shop.lng, shop.lat]
      },
      properties: {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        address: shop.address || '',
        logo: shop.logo_url,
        cover_photo: shop.cover_photo_url
      }
    }));

    console.log("Created features:", features.length);
    console.log("Sample feature:", features.length > 0 ? features[0] : "No features");

    // Update the GeoJSON data
    try {
      map.current.getSource('coffee-shops').setData({
        type: 'FeatureCollection',
        features: features
      });
      console.log("GeoJSON data updated successfully");
    } catch (error) {
      console.error("Error updating GeoJSON data:", error);
    }
  }, [shops, mapLoaded]);

  // Check for clusters whenever the map is idle
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const checkForClusters = () => {
      if (map.current) {
        const clusters = map.current.queryRenderedFeatures({ layers: ['clusters'] });
        console.log("Checking for clusters:", clusters.length);
        setHasClusters(clusters.length > 0);
      }
    };

    map.current.on('idle', checkForClusters);

    // Initial check
    checkForClusters();

    return () => {
      if (map.current) {
        map.current.off('idle', checkForClusters);
      }
    };
  }, [mapLoaded]);

  useEffect(() => {
    if (!map.current || !mapLoaded || loading || shops.length === 0) return

    // Fit the map to show all markers
    const source = map.current.getSource('coffee-shops');
    if (source && source._data && source._data.features && source._data.features.length > 0) {
      const bounds = new mapboxgl.LngLatBounds()

      source._data.features.forEach(feature => {
        if (feature.geometry && feature.geometry.coordinates) {
          bounds.extend(feature.geometry.coordinates)
        }
      })

      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      })

      // After fitting bounds, update visible shops based on what's in view
      setTimeout(() => {
        console.log("=== INITIAL VISIBLE SHOPS UPDATE ===");
        if (map.current) {
          // First try to get unclustered points
          const features = map.current.queryRenderedFeatures({ layers: ['unclustered-point'] });
          console.log("Initial unclustered features found:", features.length);

          // If we have unclustered points, use those
          if (features.length > 0) {
            console.log("Sample initial feature properties:", features[0].properties);

            const initialVisibleShops = features.map(feature => {
              const props = feature.properties;
              // Parse the properties - they might be strings due to GeoJSON serialization
              const id = typeof props.id === 'string' ? parseInt(props.id, 10) : props.id;

              // Find the corresponding shop in our shops array to get all properties
              const matchingShop = shops.find(shop => shop.id === id);
              if (!matchingShop) {
                console.log("Could not find matching shop for initial ID:", id);
                return null;
              }

              return matchingShop;
            })
              .filter(Boolean) // Remove any null values
              .slice(0, 20); // Limit to 20 cards

            console.log("Setting initial visible shops from unclustered points:", initialVisibleShops.length);
            if (initialVisibleShops.length > 0) {
              console.log("First initial shop:", initialVisibleShops[0]);
              setVisibleShops(initialVisibleShops);
              return;
            }
          }

          // If no unclustered points, check if we have clusters
          const clusters = map.current.queryRenderedFeatures({ layers: ['clusters'] });
          console.log("Initial clusters found:", clusters.length);

          // If we have clusters, use the current bounds to find shops
          if (clusters.length > 0) {
            const bounds = map.current.getBounds();

            // Find shops within the current bounds
            const shopsInBounds = shops.filter(shop => {
              if (!shop.lat || !shop.lng) return false;

              const lat = parseFloat(shop.lat);
              const lng = parseFloat(shop.lng);

              return lat >= bounds.getSouth() &&
                lat <= bounds.getNorth() &&
                lng >= bounds.getWest() &&
                lng <= bounds.getEast();
            });

            // Sort by distance from center if possible
            let sortedShops = [...shopsInBounds];
            const mapCenter = map.current.getCenter();

            sortedShops.sort((a, b) => {
              const distA = Math.sqrt(
                Math.pow(parseFloat(a.lat) - mapCenter.lat, 2) +
                Math.pow(parseFloat(a.lng) - mapCenter.lng, 2)
              );
              const distB = Math.sqrt(
                Math.pow(parseFloat(b.lat) - mapCenter.lat, 2) +
                Math.pow(parseFloat(b.lng) - mapCenter.lng, 2)
              );
              return distA - distB;
            });

            const limitedShops = sortedShops.slice(0, 20);
            console.log("Setting initial visible shops from bounds:", limitedShops.length);
            setVisibleShops(limitedShops);
            return;
          }

          // Fallback: just use the first 20 shops
          console.log("No visible features found, using first 20 shops as fallback");
          setVisibleShops(shops.slice(0, 20));
        }
      }, 500); // Small delay to ensure map has rendered
    }
  }, [shops, loading, mapLoaded])

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

    if (map.current && map.current.getSource('coffee-shops')) {
      const data = map.current.getSource('coffee-shops')._data;

      const updatedData = {
        ...data,
        properties: {
          ...data.properties,
          selected_id: shopId
        }
      };

      map.current.getSource('coffee-shops').setData(updatedData);

      const selectedFeature = data.features.find(f =>
        f.properties.id === shopId ||
        f.properties.id === shopId.toString()
      );

      if (selectedFeature && selectedFeature.geometry) {
        map.current.flyTo({
          center: selectedFeature.geometry.coordinates,
          zoom: Math.max(map.current.getZoom(), 14),
          essential: true
        });
      }
    }
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

      {/* Debug info */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="absolute top-2 left-2 bg-white bg-opacity-75 p-2 rounded text-xs z-50">
          <div>Clusters: {hasClusters ? 'Yes' : 'No'}</div>
          <div>Visible shops: {visibleShops.length}</div>
        </div>
      )}
    </div>
  )
}
