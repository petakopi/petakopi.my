import mapboxgl from "mapbox-gl"
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css"
import "mapbox-gl/dist/mapbox-gl.css"
import { setupMapEventHandlers, createGeoJSONFeatures } from "./MapEventHandler"
import { setupMapControls } from "./modules/mapControls"
import { setupMapLayers } from "./modules/mapLayers"
import { setupMapEvents } from "./modules/mapEvents"

export const initializeMapOnlyClusters = ({
  mapContainer,
  mapboxAccessToken,
  userLocation,
  setMapLoaded,
  setMapInitializing
}) => {
  if (!mapContainer.current) return null;

  mapboxgl.accessToken = mapboxAccessToken;

  const map = new mapboxgl.Map({
    container: mapContainer.current,
    style: 'mapbox://styles/mapbox/light-v11',
    center: userLocation
      ? [userLocation.longitude, userLocation.latitude]
      : [101.9758, 4.2105],
    zoom: userLocation ? 12 : 6,
    attributionControl: false
  });

  // Setup map controls
  setupMapControls(map, mapContainer);

  map.on('load', () => {
    setMapLoaded(true);
    setMapInitializing(false);

    // Setup map layers
    setupMapLayers(map);
  });

  return map;
};

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
      : [101.9758, 4.2105],
    zoom: userLocation ? 12 : 6,
    attributionControl: false
  });

  // Setup map controls
  setupMapControls(map, mapContainer);

  map.on('load', () => {
    setMapLoaded(true);
    setMapInitializing(false);
    setCurrentZoom(map.getZoom());

    // Setup map layers
    setupMapLayers(map);

    // Setup map events
    setupMapEvents(map, setCurrentZoom, setHasClusters);
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
    return false;
  }

  const features = createGeoJSONFeatures(shops);

  try {
    map.getSource('coffee-shops').setData({
      type: 'FeatureCollection',
      features: features
    });
    return true;
  } catch (error) {
    return false;
  }
};
