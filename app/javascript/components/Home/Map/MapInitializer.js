import mapboxgl from "mapbox-gl"
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder"
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css"
import "mapbox-gl/dist/mapbox-gl.css"
import { setupMapEventHandlers, createGeoJSONFeatures } from "./MapEventHandler"

export const initializeMap = ({
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
}) => {
  if (!mapContainer.current) return null;

  mapboxgl.accessToken = mapboxAccessToken;

  const map = new mapboxgl.Map({
    container: mapContainer.current,
    style: 'mapbox://styles/mapbox/light-v11',
    center: userLocation
      ? [userLocation.longitude, userLocation.latitude]
      : [101.9758, 4.2105], // Default to Malaysia view if no user location
    zoom: userLocation ? 12 : 6,
    attributionControl: false
  });

  map.addControl(new mapboxgl.AttributionControl(), 'bottom-left');
  map.addControl(new mapboxgl.NavigationControl(), 'top-right');
  map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

  const geocoder = new MapboxGeocoder({
    accessToken: mapboxAccessToken,
    mapboxgl: mapboxgl,
    marker: false,
    placeholder: 'Search for a location',
    proximity: userLocation ? { longitude: userLocation.longitude, latitude: userLocation.latitude } : undefined
  });
  map.addControl(geocoder, 'top-left');

  map.addControl(
    new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    }),
    'top-right'
  );

  map.on('zoomend', () => {
    const zoom = map.getZoom();
    console.log("Zoom changed to:", zoom);
    setCurrentZoom(zoom);
    // Note: The actual update of visible shops is now handled by the combined handler
  });

  map.on('load', () => {
    console.log("=== MAP LOADED ===");
    setMapLoaded(true);
    setMapInitializing(false);
    setCurrentZoom(map.getZoom());

    // Add the coffee shops source - start with empty features
    map.addSource('coffee-shops', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });

    map.addLayer({
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
    });

    map.addLayer({
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
    });

    map.addLayer({
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
    });

    map.on('click', 'clusters', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      });
      const clusterId = features[0].properties.cluster_id;
      map.getSource('coffee-shops').getClusterExpansionZoom(
        clusterId,
        (err, zoom) => {
          if (err) return;

          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom
          });
        }
      );
    });

    map.on('click', 'unclustered-point', (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const { id } = e.features[0].properties;

      // Convert id to number if it's a string
      const shopId = typeof id === 'string' ? parseInt(id, 10) : id;

      // First fly to the location
      map.flyTo({
        center: coordinates,
        zoom: Math.max(map.getZoom(), 14),
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

    map.on('mouseenter', 'clusters', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', () => {
      map.getCanvas().style.cursor = '';
    });
    map.on('mouseenter', 'unclustered-point', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'unclustered-point', () => {
      map.getCanvas().style.cursor = '';
    });

    // Setup map event handlers using the extracted module
    setupMapEventHandlers(map, shops, setVisibleShops, setHasClusters, mapLoaded);
  });

  return map;
};

export const highlightShopOnMap = (map, shopId) => {
  if (map && map.getSource('coffee-shops')) {
    const data = map.getSource('coffee-shops')._data;

    const updatedData = {
      ...data,
      properties: {
        ...data.properties,
        selected_id: shopId
      }
    };

    map.getSource('coffee-shops').setData(updatedData);

    const selectedFeature = data.features.find(f =>
      f.properties.id === shopId ||
      f.properties.id === shopId.toString()
    );

    if (selectedFeature && selectedFeature.geometry) {
      map.flyTo({
        center: selectedFeature.geometry.coordinates,
        zoom: Math.max(map.getZoom(), 14),
        essential: true
      });
    }
  }
};

export const updateMapSource = (map, shops) => {
  if (!map || !map.getSource('coffee-shops') || shops.length === 0) {
    console.log("Cannot update GeoJSON data: map or shops not ready");
    return false;
  }

  console.log("=== UPDATING GEOJSON DATA SOURCE ===");
  console.log("Updating GeoJSON with shops:", shops.length);

  // Use the imported createGeoJSONFeatures function from MapEventHandler
  // This is now imported at the top of the file
  const features = createGeoJSONFeatures(shops);

  console.log("Created features:", features.length);
  console.log("Sample feature:", features.length > 0 ? features[0] : "No features");

  // Update the GeoJSON data
  try {
    map.getSource('coffee-shops').setData({
      type: 'FeatureCollection',
      features: features
    });
    console.log("GeoJSON data updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating GeoJSON data:", error);
    return false;
  }
};
