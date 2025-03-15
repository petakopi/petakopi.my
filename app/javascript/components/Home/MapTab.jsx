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
          
          // Always set visible shops to the first 20 shops
          const initialVisibleShops = fetchedShops.slice(0, 20);
          console.log("Setting initial visible shops:", initialVisibleShops.length);
          setVisibleShops(initialVisibleShops);
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

  // Always ensure we have visible shops if we have shops
  useEffect(() => {
    if (shops.length > 0 && visibleShops.length === 0) {
      console.log("Resetting visible shops because they were empty");
      setVisibleShops(shops.slice(0, 20));
    }
  }, [shops, visibleShops]);

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
    });

    map.current.on('load', () => {
      setMapLoaded(true)
      setMapInitializing(false)
      setCurrentZoom(map.current.getZoom());

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

      map.current.on('moveend', () => {
        if (!map.current || !mapLoaded || !map.current.getSource('coffee-shops')) return;

        // Update visible shops based on what's currently in view
        const features = map.current.queryRenderedFeatures({ layers: ['unclustered-point'] });
        console.log("Found features in current view:", features.length);
        
        if (features.length === 0) {
          // If no features are visible, keep showing the current visible shops
          return;
        }
        
        // Convert features to shop objects and limit to 20
        const shopsInView = features.map(feature => {
          const props = feature.properties;
          // Parse the properties - they might be strings due to GeoJSON serialization
          const id = typeof props.id === 'string' ? parseInt(props.id, 10) : props.id;
          
          // Find the corresponding shop in our shops array to get all properties
          const matchingShop = shops.find(shop => shop.id === id);
          if (!matchingShop) return null;
          
          return matchingShop;
        })
        .filter(Boolean) // Remove any null values
        .slice(0, 20); // Limit to 20 cards
        
        console.log("Setting visible shops:", shopsInView.length);
        if (shopsInView.length > 0) {
          setVisibleShops(shopsInView);
        }
      });
    })

    return () => {
      if (map.current) map.current.remove()
      clearMarkers()
    }
  }, [])

  useEffect(() => {
    if (!map.current || !mapLoaded || loading || shops.length === 0) return

    // Check if we already have the GeoJSON data
    if (!map.current.getSource('coffee-shops')._data.features || 
        map.current.getSource('coffee-shops')._data.features.length === 0) {
      
      // If we don't have GeoJSON data yet, create it from the shops array
      const features = shops
        .filter(shop => shop.lat && shop.lng)
        .map(shop => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [parseFloat(shop.lng), parseFloat(shop.lat)]
          },
          properties: {
            id: shop.id,
            name: shop.name,
            address: shop.address,
            slug: shop.slug,
            logo: shop.logo_url,
            cover_photo: shop.cover_photo_url
          }
        }))

      if (map.current.getSource('coffee-shops')) {
        map.current.getSource('coffee-shops').setData({
          type: 'FeatureCollection',
          features
        })
      }
    }

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
        if (map.current) {
          const features = map.current.queryRenderedFeatures({ layers: ['unclustered-point'] });
          const initialVisibleShops = features.map(feature => {
            const props = feature.properties;
            // Parse the properties - they might be strings due to GeoJSON serialization
            const id = typeof props.id === 'string' ? parseInt(props.id, 10) : props.id;
            
            // Find the corresponding shop in our shops array to get all properties
            const matchingShop = shops.find(shop => shop.id === id);
            if (!matchingShop) return null;
            
            return matchingShop;
          })
          .filter(Boolean) // Remove any null values
          .slice(0, 20); // Limit to 20 cards
          
          setVisibleShops(initialVisibleShops);
        }
      }, 500); // Small delay to ensure map has rendered
    }
  }, [shops, loading, mapLoaded])

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

  // Always use the first 20 shops if visibleShops is empty
  const displayShops = visibleShops.length > 0 ? visibleShops : shops.slice(0, 20);

  console.log("Render state:", { 
    shopsLength: shops.length, 
    visibleShopsLength: visibleShops.length,
    displayShopsLength: displayShops.length,
    loading,
    mapInitializing,
    firstShop: shops.length > 0 ? shops[0] : null,
    firstVisibleShop: visibleShops.length > 0 ? visibleShops[0] : null,
    firstDisplayShop: displayShops.length > 0 ? displayShops[0] : null
  });

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

      {displayShops.length > 0 && (
        <MapCardList
          visibleShops={displayShops}
          selectedShopId={selectedShopId}
          highlightedShopId={highlightedShopId}
          onCardClick={handleCardClick}
        />
      )}
    </div>
  )
}
