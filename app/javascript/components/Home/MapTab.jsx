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

    map.current.on('load', () => {
      setMapLoaded(true)
      setMapInitializing(false)

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
          'circle-color': '#6B4F4F',
          'circle-radius': 6,
          'circle-stroke-width': 2,
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

      {/* Map legend */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-md shadow-md z-10">
        <h4 className="font-medium text-sm mb-2 text-gray-700">Map Legend</h4>
        <div className="flex items-center mb-2">
          <div className="w-4 h-4 rounded-full bg-[#6B4F4F] border-2 border-white mr-2"></div>
          <span className="text-xs text-gray-600">Coffee Shop</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-full bg-[#6B4F4F] flex items-center justify-center text-white text-xs mr-2">5</div>
          <span className="text-xs text-gray-600">Shop Cluster (click to expand)</span>
        </div>
      </div>
    </div>
  )
}
