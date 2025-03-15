import React, { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder"
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css"
import "mapbox-gl/dist/mapbox-gl.css"

// Import refactored view components
import MapCardList from "./Map/MapCardList"
import MapStyles from "./Map/MapStyles"

export default function MapTab({
  shops,
  loading,
  userLocation,
  mapboxAccessToken = "pk.eyJ1IjoiYW1yZWV6IiwiYSI6ImNsMDN3bW5rZDBidGYzZHBpdmZjMDVpbzkifQ.F8fdxihnLv9ZTuDjufmICQ"
}) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapInitializing, setMapInitializing] = useState(true)
  const [currentZoom, setCurrentZoom] = useState(0)
  const [visibleShops, setVisibleShops] = useState([])
  const [showCards, setShowCards] = useState(false)
  const [selectedShopId, setSelectedShopId] = useState(null)
  const [highlightedShopId, setHighlightedShopId] = useState(null)
  const highlightTimeoutRef = useRef(null)
  const markersRef = useRef([])
  const clustersRef = useRef(null)

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
      setShowCards(zoom >= 13); // Show cards when zoomed in enough
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
        if (!map.current.getSource('coffee-shops')) return;

        const currentZoom = map.current.getZoom();
        console.log("Map moved, current zoom:", currentZoom);

        if (currentZoom >= 13) {
          const features = map.current.queryRenderedFeatures({ layers: ['unclustered-point'] });
          console.log("Found features:", features.length);

          const shopsInView = features.map(feature => {
            const props = feature.properties;
            return {
              id: typeof props.id === 'string' ? parseInt(props.id, 10) : props.id,
              name: props.name,
              address: props.address,
              slug: props.slug,
              logo: props.logo,
              cover_photo: props.cover_photo,
              lat: feature.geometry.coordinates[1],
              lng: feature.geometry.coordinates[0]
            };
          });

          console.log("Setting visible shops:", shopsInView.length);
          setVisibleShops(shopsInView);
        } else {
          console.log("Zoom level too low for cards");
          setVisibleShops([]);
        }
      });
    })

    return () => {
      if (map.current) map.current.remove()
      clearMarkers()
    }
  }, [])

  useEffect(() => {
    if (!map.current || !mapLoaded || loading) return

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
          logo: shop.logo,
          cover_photo: shop.cover_photo
        }
      }))

    if (map.current.getSource('coffee-shops')) {
      map.current.getSource('coffee-shops').setData({
        type: 'FeatureCollection',
        features
      })
    }

    if (features.length > 0) {
      const bounds = new mapboxgl.LngLatBounds()

      features.forEach(feature => {
        bounds.extend(feature.geometry.coordinates)
      })

      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      })
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
          <p className="text-gray-700 font-medium">No coffee shops found in this area</p>
          <p className="text-gray-500 text-sm mt-1">Try zooming out or searching in a different location</p>
        </div>
      )}

      {showCards && visibleShops.length > 0 && (
        <MapCardList
          visibleShops={visibleShops}
          selectedShopId={selectedShopId}
          highlightedShopId={highlightedShopId}
          onCardClick={handleCardClick}
        />
      )}
    </div>
  )
}
