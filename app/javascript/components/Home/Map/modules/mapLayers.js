const MAPS_API_URL = "/api/v1/maps";

export const setupMapLayers = (map) => {
  // Ensure map is loaded before proceeding
  if (!map.loaded()) {
    map.once('load', () => setupMapLayers(map));
    return;
  }

  return fetch(MAPS_API_URL)
    .then((res) => res.json())
    .then((response) => {
      const { data } = response;

      // Remove existing source and layers if they exist
      if (map.getSource('coffee_shops')) {
        map.removeLayer('unclustered-point');
        map.removeLayer('cluster-count');
        map.removeLayer('clusters');
        map.removeSource('coffee_shops');
      }

      map.addSource("coffee_shops", {
        type: "geojson",
        data: data.geojson,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "coffee_shops",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#6B4F4F",
            10,
            "#5D4037",
            25,
            "#4E342E",
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            20,
            10,
            30,
            25,
            40,
          ],
        },
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "coffee_shops",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
        paint: {
          "text-color": "#ffffff",
        },
      });

      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "coffee_shops",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#6B4F4F",
          "circle-radius": 14,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });
    });
};
