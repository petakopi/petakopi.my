import { useEffect, useState, useRef } from "react";
import { initializeMap, addMapControls, addMapStyles } from "./Map/modules/mapInitializer";
import { setupMapLayers } from "./Map/modules/mapLayers";
import { setupMapEvents } from "./Map/modules/mapEvents";
import { applyFiltersToUrl } from "../../utils/filters";

const DEFAULT_CENTER = [101.7117, 3.1578]; // KLCC coordinates
const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoiYW1yZWV6IiwiYSI6ImNsMDN3bW5rZDBidGYzZHBpdmZjMDVpbzkifQ.F8fdxihnLv9ZTuDjufmICQ";
const MAPS_API_URL = "/api/v1/maps";

export default function useMapbox(mapContainer, height = "100vh", shouldInitialize = false, filters = {}) {
  const map = useRef(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const initialized = useRef(false);

  // Function to update map data with filters
  const updateMapData = async () => {
    if (!map.current || !map.current.getSource('coffee_shops')) return;

    setLoading(true);
    try {
      // Build URL with filters
      const url = new URL(MAPS_API_URL, window.location.origin);

      // Apply filters using the shared function
      applyFiltersToUrl(url, filters);

      // Fetch new data
      const response = await fetch(url);
      const { data } = await response.json();

      // Convert the data to GeoJSON format
      const geojson = {
        type: 'FeatureCollection',
        features: data.coffee_shops.map(shop => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [shop.lng, shop.lat]
          },
          properties: {
            id: shop.id,
            name: shop.name,
            url: shop.url,
            logo: shop.logo_url
          }
        }))
      };

      // Update map source
      const source = map.current.getSource('coffee_shops');
      if (source) {
        source.setData(geojson);
      }
    } catch (error) {
      console.error('Error updating map data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !shouldInitialize) return;

    // Only initialize the map if it hasn't been initialized yet
    if (!initialized.current) {
      // Initialize map
      map.current = initializeMap(mapContainer);
      if (!map.current) return;

      // Add map styles
      addMapStyles();

      // Add map controls
      const geolocate = addMapControls(map.current);

      // Setup map load handler
      map.current.on("load", () => {
        setMapLoaded(true);
        geolocate.trigger();

        // Setup map layers
        setupMapLayers(map.current).then(() => {
          setLoading(false);
        });

        // Setup map events
        setupMapEvents(map.current);
      });

      initialized.current = true;
    } else {
      // If map is already initialized, just update the container
      if (map.current) {
        map.current.resize();
      }
    }

    // Cleanup function
    return () => {
      // Only remove the map when the component is unmounted
      if (map.current && !shouldInitialize) {
        map.current.remove();
        map.current = null;
        initialized.current = false;
      }
    };
  }, [shouldInitialize]); // Only re-run when shouldInitialize changes

  // Update map data when filters change
  useEffect(() => {
    if (mapLoaded) {
      updateMapData();
    }
  }, [filters, mapLoaded]);

  return { loading, mapLoaded };
}
