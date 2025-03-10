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
  const markersRef = useRef([])
  const clustersRef = useRef(null)

  // Initialize map when component mounts
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

    // Add attribution control in bottom-left
    map.current.addControl(new mapboxgl.AttributionControl(), 'bottom-left')

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Add geocoder (search box)
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxAccessToken,
      mapboxgl: mapboxgl,
      marker: false,
      placeholder: 'Search for a location',
      proximity: userLocation ? { longitude: userLocation.longitude, latitude: userLocation.latitude } : undefined
    })
    map.current.addControl(geocoder, 'top-left')

    // Create a custom "Locate Me" button
    const locateMe = document.createElement('div');
    locateMe.className = 'mapboxgl-ctrl mapboxgl-ctrl-group locate-me-button';
    locateMe.innerHTML = `
      <button type="button" title="Find my location">
        <span class="mapboxgl-ctrl-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </span>
      </button>
    `;
    locateMe.addEventListener('click', () => {
      // Try to get user location
      if (navigator.geolocation) {
        setMapInitializing(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            map.current.flyTo({
              center: [longitude, latitude],
              zoom: 14,
              essential: true
            });
            setMapInitializing(false);
          },
          (error) => {
            console.error("Error getting location:", error);
            setMapInitializing(false);
            // Show error message
            const errorMsg = document.createElement('div');
            errorMsg.className = 'map-error-message';
            errorMsg.textContent = 'Could not access your location. Please check your browser settings.';
            document.body.appendChild(errorMsg);
            setTimeout(() => {
              document.body.removeChild(errorMsg);
            }, 3000);
          },
          { enableHighAccuracy: true }
        );
      }
    });

    // Add the custom locate button to the map
    map.current.addControl({
      onAdd: function() {
        return locateMe;
      },
      onRemove: function() {
        return locateMe.parentNode.removeChild(locateMe);
      }
    }, 'top-right');

    // Add geolocation control (hidden but still functional)
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      }),
      'bottom-right'
    )

    // Add zoom change listener
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

      // Add a filter control to the map
      const filterControl = document.createElement('div');
      filterControl.className = 'mapboxgl-ctrl mapboxgl-ctrl-group filter-control';

      // Create a dropdown for filtering
      const filterSelect = document.createElement('select');
      filterSelect.className = 'filter-select';

      // Add options
      const options = [
        { value: 'all', label: 'All Coffee Shops' },
        { value: 'rating', label: 'Highest Rated' },
        { value: 'newest', label: 'Newest Added' }
      ];

      options.forEach(option => {
        const optionEl = document.createElement('option');
        optionEl.value = option.value;
        optionEl.textContent = option.label;
        filterSelect.appendChild(optionEl);
      });

      // Add event listener
      filterSelect.addEventListener('change', (e) => {
        const value = e.target.value;
        // Here you would implement the actual filtering logic
        // For now, we'll just log the selected filter
        console.log(`Filter selected: ${value}`);
      });

      filterControl.appendChild(filterSelect);

      // Add the filter control to the map
      map.current.addControl({
        onAdd: function() {
          return filterControl;
        },
        onRemove: function() {
          return filterControl.parentNode.removeChild(filterControl);
        }
      }, 'top-left');

      // Add a source for clusters
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

      // Add a layer for the clusters
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

      // Add a layer for the cluster counts
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

      // Add a layer for individual points
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

      // Inspect a cluster on click
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

      // Show popup on unclustered point click
      map.current.on('click', 'unclustered-point', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice()
        const { id, name, address, slug, logo_url } = e.features[0].properties

        // Create popup content
        const popupContent = document.createElement('div')
        popupContent.className = 'map-popup max-w-xs'

        // Create header with shop name
        const header = document.createElement('div')
        header.className = 'bg-brown-500 text-white p-3 rounded-t'

        const title = document.createElement('h3')
        title.className = 'font-bold text-lg'
        title.textContent = name
        header.appendChild(title)

        popupContent.appendChild(header)

        // Add shop info
        const content = document.createElement('div')
        content.className = 'p-4'

        if (address) {
          const addressEl = document.createElement('p')
          addressEl.className = 'text-sm text-gray-600 mb-3 flex items-start'
          addressEl.innerHTML = `
            <svg class="mr-1 mt-0.5 flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="#6B4F4F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="10" r="3" stroke="#6B4F4F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>${address}</span>
          `
          content.appendChild(addressEl)
        }

        // Add buttons container
        const buttonsContainer = document.createElement('div')
        buttonsContainer.className = 'flex space-x-2 mt-2'

        // View details button
        const viewDetailsBtn = document.createElement('a')
        viewDetailsBtn.href = `/coffee_shops/${slug}`
        viewDetailsBtn.className = 'flex-1 bg-brown-500 hover:bg-brown-600 text-white py-2 px-3 rounded text-sm font-medium text-center transition-colors'
        viewDetailsBtn.textContent = 'View Details'
        buttonsContainer.appendChild(viewDetailsBtn)

        // Get directions button
        const directionsBtn = document.createElement('a')
        directionsBtn.href = `https://www.google.com/maps/dir/?api=1&destination=${coordinates[1]},${coordinates[0]}`
        directionsBtn.target = '_blank'
        directionsBtn.rel = 'noopener noreferrer'
        directionsBtn.className = 'flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-3 rounded text-sm font-medium text-center transition-colors'
        directionsBtn.textContent = 'Directions'
        buttonsContainer.appendChild(directionsBtn)

        content.appendChild(buttonsContainer)
        popupContent.appendChild(content)

        // Create popup with custom styling
        new mapboxgl.Popup({
          offset: 25,
          maxWidth: '320px',
          className: 'coffee-shop-popup'
        })
          .setLngLat(coordinates)
          .setDOMContent(popupContent)
          .addTo(map.current)
      })

      // Change cursor on hover
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

      // Update visible shops when map moves
      map.current.on('moveend', () => {
        if (!map.current.getSource('coffee-shops')) return;

        const currentZoom = map.current.getZoom();
        console.log("Map moved, current zoom:", currentZoom);

        // Only update visible shops if we're zoomed in enough
        if (currentZoom >= 13) {
          const features = map.current.queryRenderedFeatures({ layers: ['unclustered-point'] });
          console.log("Found features:", features.length);

          // Extract shop data from features
          const shopsInView = features.map(feature => {
            // Parse the properties which might be strings due to GeoJSON serialization
            const props = feature.properties;
            return {
              id: typeof props.id === 'string' ? parseInt(props.id, 10) : props.id,
              name: props.name,
              address: props.address,
              slug: props.slug,
              logo_url: props.logo_url,
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

    // Clean up on unmount
    return () => {
      if (map.current) map.current.remove()
      clearMarkers()
    }
  }, [])

  // Update markers when shops data changes
  useEffect(() => {
    if (!map.current || !mapLoaded || loading) return

    // Convert shops to GeoJSON
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
          logo_url: shop.logo_url
        }
      }))

    // Update the source data
    if (map.current.getSource('coffee-shops')) {
      map.current.getSource('coffee-shops').setData({
        type: 'FeatureCollection',
        features
      })
    }

    // Fit bounds to markers if we have shops
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

  // Helper to clear markers (for legacy cleanup)
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []
  }

  // Function to highlight a shop on the map
  const highlightShop = (shopId) => {
    setSelectedShopId(shopId);

    if (map.current && map.current.getSource('coffee-shops')) {
      // Get the current data
      const data = map.current.getSource('coffee-shops')._data;

      // Update the selected_id property in the source
      if (data && data.features) {
        // Add the selected_id to the source properties
        const updatedData = {
          ...data,
          properties: {
            ...data.properties,
            selected_id: shopId
          }
        };

        // Update the source
        map.current.getSource('coffee-shops').setData(updatedData);

        // Find the shop coordinates to fly to
        const selectedFeature = data.features.find(f =>
          f.properties.id === shopId ||
          f.properties.id === shopId.toString()
        );

        if (selectedFeature && selectedFeature.geometry) {
          // Fly to the selected shop
          map.current.flyTo({
            center: selectedFeature.geometry.coordinates,
            zoom: Math.max(map.current.getZoom(), 14),
            essential: true
          });
        }
      }
    }
  }

  // Function to render coffee shop cards
  const renderShopCards = () => {
    if (!showCards || visibleShops.length === 0) return null;

    console.log("Rendering shop cards:", visibleShops.length, "shops visible");

    // Limit to 20 shops
    const limitedShops = visibleShops.slice(0, 20);
    const hasMore = visibleShops.length > 20;

    return (
      <div className="absolute bottom-4 left-4 right-4 z-10 overflow-x-auto pb-2 max-h-[250px]">
        <div 
          className="flex space-x-4 px-2 py-2 rounded-lg" 
          style={{ 
            scrollbarWidth: 'thin', 
            scrollbarColor: '#6B4F4F #f5f5f5',
            cursor: 'grab'
          }}
          ref={el => {
            if (el) {
              // Add mouse drag scrolling
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
              className={`flex-shrink-0 w-64 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg overflow-hidden transition-all ${selectedShopId === shop.id
                ? 'shadow-lg ring-2 ring-brown-500'
                : 'shadow-md hover:shadow-lg'
                }`}
              onClick={() => highlightShop(shop.id)}
            >
              <a
                href={`/coffee_shops/${shop.slug}`}
                className="block"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent the parent onClick from firing
                }}
              >
                <div className="h-24 bg-brown-100 flex items-center justify-center">
                  {shop.logo_url ? (
                    <img
                      src={shop.logo_url}
                      alt={shop.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                      }}
                    />
                  ) : (
                    <div className="text-brown-500 text-center p-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-brown-800 truncate">{shop.name}</h3>
                  {shop.address && (
                    <p className="text-xs text-gray-600 mt-1 truncate">{shop.address}</p>
                  )}
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xs text-brown-600">View details</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brown-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </a>
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
      {/* Add custom styles for our map components */}
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

      {/* Loading overlay */}
      {(loading || mapInitializing) && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex flex-col justify-center items-center rounded-lg z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brown-500 mb-4"></div>
          <p className="text-brown-700 font-medium">
            {mapInitializing ? 'Initializing map...' : 'Loading coffee shops...'}
          </p>
        </div>
      )}

      {/* No results message */}
      {shops.length === 0 && !loading && !mapInitializing && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white py-3 px-6 rounded-lg shadow-md z-10">
          <p className="text-gray-700 font-medium">No coffee shops found in this area</p>
          <p className="text-gray-500 text-sm mt-1">Try zooming out or searching in a different location</p>
        </div>
      )}

      {/* Coffee shop cards */}
      {renderShopCards()}


    </div>
  )
}
