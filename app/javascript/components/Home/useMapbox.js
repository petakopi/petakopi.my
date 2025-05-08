import { useEffect, useState, useRef } from "react";
import { initializeMap, addMapControls, addMapStyles } from "./Map/modules/mapInitializer";
import { setupMapLayers } from "./Map/modules/mapLayers";
import { setupMapEvents } from "./Map/modules/mapEvents";

const DEFAULT_CENTER = [101.7117, 3.1578]; // KLCC coordinates
const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoiYW1yZWV6IiwiYSI6ImNsMDN3bW5rZDBidGYzZHBpdmZjMDVpbzkifQ.F8fdxihnLv9ZTuDjufmICQ";
const GEOJSON_URL = "/mapbox?type=geojson";

export default function useMapbox(mapContainer, height = "100vh", shouldInitialize = false) {
  const map = useRef(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const initialized = useRef(false);

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

  return { loading, mapLoaded };
}
