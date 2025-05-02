import mapboxgl from "mapbox-gl";
import { setupMapControls } from "./mapControls";
import { setupMapLayers } from "./mapLayers";
import { setupMapEvents } from "./mapEvents";

export const initializeMap = ({
  mapContainer,
  mapboxAccessToken,
  userLocation,
  defaultCenter,
  setMapLoaded,
  setMapInitializing,
  setCurrentZoom,
  shops,
  setHasClusters,
  mapLoaded
}) => {
  if (!mapContainer.current) return null;

  mapboxgl.accessToken = mapboxAccessToken;

  const map = new mapboxgl.Map({
    container: mapContainer.current,
    style: "mapbox://styles/mapbox/light-v11",
    center: userLocation
      ? [userLocation.longitude, userLocation.latitude]
      : defaultCenter
        ? [defaultCenter.longitude, defaultCenter.latitude]
        : [101.6869, 3.1390],
    zoom: 13,
    attributionControl: false,
    accessToken: mapboxAccessToken
  });

  // Add navigation control
  map.addControl(
    new mapboxgl.NavigationControl({
      showCompass: false
    }),
    "top-right"
  );

  // Add attribution control
  map.addControl(
    new mapboxgl.AttributionControl({
      compact: true
    })
  );

  // Add geolocation control
  const geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true,
    showUserHeading: true
  });
  map.addControl(geolocate, "top-right");

  // Add scale control
  map.addControl(
    new mapboxgl.ScaleControl({
      maxWidth: 100,
      unit: "metric"
    }),
    "bottom-left"
  );

  // Add fullscreen control
  map.addControl(
    new mapboxgl.FullscreenControl(),
    "top-right"
  );

  // Add zoom control
  map.addControl(
    new mapboxgl.NavigationControl({
      showCompass: false
    }),
    "top-right"
  );

  // Add zoom level indicator
  map.on("zoom", () => {
    setCurrentZoom(map.getZoom());
  });

  // Add map load handler
  map.on("load", () => {
    setMapLoaded(true);
    setMapInitializing(false);

    // Setup map layers
    setupMapLayers(map);

    // Setup map events
    setupMapEvents(map, setCurrentZoom, setHasClusters);

    // Automatically trigger geolocation
    geolocate.trigger();
  });

  // Add map error handler
  map.on("error", (e) => {
    console.error("Map error:", e);
    setMapInitializing(false);
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
