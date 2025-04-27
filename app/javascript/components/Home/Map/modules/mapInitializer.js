import mapboxgl from "mapbox-gl";
import { setupMapControls } from "./mapControls";
import { setupMapLayers } from "./mapLayers";
import { setupMapEvents } from "./mapEvents";

export const initializeMap = ({
  mapContainer,
  mapboxAccessToken,
  userLocation,
  setMapLoaded,
  setMapInitializing,
  setCurrentZoom,
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
