import React, { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder"
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css"
import "mapbox-gl/dist/mapbox-gl.css"

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

  const renderShopCards = () => {
    if (!showCards || visibleShops.length === 0) return null;

    console.log("Rendering shop cards:", visibleShops.length, "shops visible");

    const limitedShops = visibleShops.slice(0, 20);
    const hasMore = visibleShops.length > 20;

    return (
      <div id="map-cards-container" className="absolute bottom-4 left-4 right-4 z-10 overflow-x-auto pb-2 max-h-[250px]">
        <div
          className="flex space-x-4 px-2 py-2 rounded-lg"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#6B4F4F #f5f5f5',
            cursor: 'grab'
          }}
          ref={el => {
            if (el) {
              let isDown = false;
              let startX;
              let scrollLeft;

              el.addEventListener('mousedown', (e) => {
                isDown = true;
                el.style.cursor = 'grabbing';
                startX = e.pageX - el.offsetLeft;
                scrollLeft = el.scrollLeft;
                e.preventDefault();
              });

              el.addEventListener('mouseleave', () => {
                isDown = false;
                el.style.cursor = 'grab';
              });

              el.addEventListener('mouseup', () => {
                isDown = false;
                el.style.cursor = 'grab';
              });

              el.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - el.offsetLeft;
                const walk = (x - startX) * 2; // Scroll speed
                el.scrollLeft = scrollLeft - walk;
              });
            }
          }}
        >
          {limitedShops.map((shop, index) => (
            <div
              key={`shop-${shop.id || index}`}
              id={`shop-${shop.id}`}
              className={`flex-shrink-0 w-64 bg-white rounded-lg overflow-hidden transition-all cursor-pointer 
                ${selectedShopId === shop.id && !highlightedShopId ? 'shadow-lg ring-2 ring-brown-500' : 'shadow-md hover:shadow-lg'}
                ${highlightedShopId === shop.id ? 'card-highlight-animation' : ''}
              `}
              onClick={() => {
                highlightShop(shop.id);
                window.location.href = `/coffee_shops/${shop.slug}`;
              }}
            >
              <div className="flex flex-col h-full">
                <div className="w-full">
                  {shop.cover_photo ? (
                    <div className="w-full h-32 overflow-hidden">
                      <img
                        src={shop.cover_photo}
                        alt={`${shop.name} cover`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                      <div className="h-20 w-20 rounded-full flex items-center justify-center bg-gray-200">
                        <svg className="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-10 w-10">
                      {shop.logo ? (
                        <img
                          src={shop.logo}
                          alt={`${shop.name} logo`}
                          className="h-10 w-10 rounded-full border border-brown"
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/40x40?text=Logo";
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gray-200">
                          <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-gray-900">{shop.name}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {hasMore && (
            <div key="more-info" className="flex-shrink-0 w-64 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-md overflow-hidden border-2 border-dashed border-brown-200">
              <div className="h-full p-4 flex flex-col items-center justify-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brown-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-brown-600">
                  Cards limited to 20 coffee shops.
                  <span className="block mt-1">Please zoom in further to see all shops in this area.</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="col-span-3 relative">
      <style>{`
        .locate-me-button {
          margin-top: 10px;
        }

        .locate-me-button button {
          padding: 6px;
          background: #fff;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .locate-me-button button:hover {
          background: #f0f0f0;
        }

        .filter-control {
          margin-top: 10px;
          margin-left: 10px;
          padding: 5px;
        }

        .filter-select {
          padding: 5px 10px;
          border: none;
          border-radius: 2px;
          font-size: 12px;
          font-family: inherit;
          background-color: white;
          cursor: pointer;
        }

        /* Fix for fullscreen button on mobile */
        .mapboxgl-ctrl-fullscreen {
          display: block !important;
        }

        /* Ensure controls are visible on mobile */
        @media (max-width: 640px) {
          .mapboxgl-ctrl-top-right {
            display: flex !important;
            flex-direction: column;
          }

          .mapboxgl-ctrl-top-right .mapboxgl-ctrl {
            margin: 10px 10px 0 0 !important;
            display: block !important;
          }
        }

        .coffee-shop-popup .mapboxgl-popup-content {
          padding: 0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .coffee-shop-popup .mapboxgl-popup-close-button {
          font-size: 16px;
          color: white;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 50%;
          width: 24px;
          height: 24px;
          line-height: 22px;
          text-align: center;
          top: 8px;
          right: 8px;
          padding: 0;
        }

        .coffee-shop-popup .mapboxgl-popup-close-button:hover {
          background: rgba(0, 0, 0, 0.5);
        }

        .map-error-message {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: #f44336;
          color: white;
          padding: 10px 20px;
          border-radius: 4px;
          z-index: 9999;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
      `}</style>

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

      {renderShopCards()}

      <style>
        {`
        @keyframes highlight-pulse {
          0% { box-shadow: 0 0 0 0 rgba(139, 69, 19, 0.7); border: none; }
          50% { box-shadow: 0 0 0 10px rgba(139, 69, 19, 0.4); border: none; }
          100% { box-shadow: 0 0 0 0 rgba(139, 69, 19, 0); border: none; }
        }
        
        .card-highlight-animation {
          animation: highlight-pulse 1.5s ease-out;
          animation-iteration-count: 2;
          border: none !important;
        }
        `}
      </style>
    </div>
  )
}
