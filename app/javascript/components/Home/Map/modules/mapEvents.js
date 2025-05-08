import mapboxgl from "mapbox-gl";
import { createCoffeeShopPopup } from "./CoffeeShopPopup";

export const setupMapEvents = (map) => {
  // Cluster click zoom
  map.on("click", "clusters", (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["clusters"],
    });
    const clusterId = features[0].properties.cluster_id;
    map
      .getSource("coffee_shops")
      .getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;
        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom,
        });
      });
  });

  // Popup for unclustered points
  map.on("click", "unclustered-point", (e) => {
    // Remove any existing popup first
    const existingPopup = document.querySelector(".mapboxgl-popup");
    if (existingPopup) {
      existingPopup.remove();
    }

    const feature = e.features[0];
    const coordinates = feature.geometry.coordinates.slice();
    const { name, url, logo } = feature.properties;
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    createCoffeeShopPopup(map, coordinates, { name, url, logo });
  });

  // Change cursor on hover
  map.on("mouseenter", "clusters", () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "clusters", () => {
    map.getCanvas().style.cursor = "";
  });

  map.on("mouseenter", "unclustered-point", () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "unclustered-point", () => {
    map.getCanvas().style.cursor = "";
  });
};
