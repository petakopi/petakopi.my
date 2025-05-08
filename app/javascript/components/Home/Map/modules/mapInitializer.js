import mapboxgl from "mapbox-gl";
import { setupMapControls } from "./mapControls";
import { setupMapLayers } from "./mapLayers";
import { setupMapEvents } from "./mapEvents";

const DEFAULT_CENTER = [101.7117, 3.1578]; // KLCC coordinates
const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoiYW1yZWV6IiwiYSI6ImNsMDN3bW5rZDBidGYzZHBpdmZjMDVpbzkifQ.F8fdxihnLv9ZTuDjufmICQ";

export const initializeMap = (mapContainer) => {
  if (!mapContainer.current) return null;

  mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
  const map = new mapboxgl.Map({
    container: mapContainer.current,
    style: "mapbox://styles/mapbox/light-v10?optimize=true",
    center: DEFAULT_CENTER,
    zoom: 10,
  });

  // Set container styles
  if (mapContainer.current) {
    mapContainer.current.style.width = "100%";
    mapContainer.current.style.height = "100%";
    mapContainer.current.style.margin = "0";
    mapContainer.current.style.padding = "0";
    mapContainer.current.style.overflow = "hidden";
  }

  return map;
};

export const addMapControls = (map) => {
  map.addControl(new mapboxgl.NavigationControl(), "top-right");
  map.addControl(new mapboxgl.FullscreenControl(), "top-right");
  const geolocate = new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserHeading: true,
  });
  map.addControl(geolocate, "top-right");
  return geolocate;
};

export const addMapStyles = () => {
  const style = document.createElement("style");
  style.textContent = `
    .mapboxgl-map {
      width: 100% !important;
      height: 100% !important;
      overflow: hidden !important;
    }

    .mapboxgl-ctrl-top-right {
      top: 10px !important; /* Move map controls below header */
    }

    /* Ensure popups appear above all other content */
    .mapboxgl-popup {
      z-index: 10 !important;
    }
  `;
  document.head.appendChild(style);
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
