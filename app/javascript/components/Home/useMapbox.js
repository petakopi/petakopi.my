import { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

const DEFAULT_CENTER = [101.7117, 3.1578]; // KLCC coordinates
const MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoiYW1yZWV6IiwiYSI6ImNsMDN3bW5rZDBidGYzZHBpdmZjMDVpbzkifQ.F8fdxihnLv9ZTuDjufmICQ";
const GEOJSON_URL = "/mapbox?type=geojson";

export default function useMapbox(mapContainer, height = '60vh') {
  const map = useRef(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v10?optimize=true",
      center: DEFAULT_CENTER,
      zoom: 10,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
    });
    map.current.addControl(geolocate, 'top-right');

    map.current.on("load", () => {
      setMapLoaded(true);
      geolocate.trigger();
      fetch(GEOJSON_URL)
        .then((res) => res.json())
        .then((geojson) => {
          map.current.addSource("coffee_shops", {
            type: "geojson",
            data: geojson,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50,
          });

          map.current.addLayer({
            id: "clusters",
            type: "circle",
            source: "coffee_shops",
            filter: ["has", "point_count"],
            paint: {
              "circle-color": [
                "step",
                ["get", "point_count"],
                "#6B4F4F",
                10, "#5D4037",
                25, "#4E342E",
              ],
              "circle-radius": [
                "step",
                ["get", "point_count"],
                20,
                10, 30,
                25, 40,
              ],
            },
          });

          map.current.addLayer({
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

          map.current.addLayer({
            id: "unclustered-point",
            type: "circle",
            source: "coffee_shops",
            filter: ["!", ["has", "point_count"]],
            paint: {
              "circle-color": "#6B4F4F",
              "circle-radius": 14, // Larger dot
              "circle-stroke-width": 2,
              "circle-stroke-color": "#fff",
            },
          });

          setLoading(false);
        });

      // Cluster click zoom
      map.current.on("click", "clusters", (e) => {
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        const clusterId = features[0].properties.cluster_id;
        map.current.getSource("coffee_shops").getClusterExpansionZoom(
          clusterId,
          (err, zoom) => {
            if (err) return;
            map.current.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom,
            });
          }
        );
      });

      // Popup for unclustered points
      map.current.on("click", "unclustered-point", (e) => {
        const feature = e.features[0];
        const coordinates = feature.geometry.coordinates.slice();
        const { name, url, logo } = feature.properties;
        const popupText = `
          <div style="min-width:200px;max-width:260px;padding:20px 18px 18px 18px;background:white;border-radius:18px;box-shadow:0 4px 24px rgba(0,0,0,0.10);display:flex;flex-direction:column;align-items:center;position:relative;">
            <button onclick="this.closest('.mapboxgl-popup-content').parentElement._popup.remove()" style="position:absolute;top:10px;right:10px;background:none;border:none;cursor:pointer;font-size:1.5rem;line-height:1;color:#6B4F4F;font-weight:bold;">&times;</button>
            <img src="${logo}" alt="${name} logo" style="width:64px;height:64px;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.10);object-fit:cover;margin-bottom:16px;" />
            <div style="font-weight:700;font-size:1.15rem;color:#3d2c2c;text-align:center;margin-bottom:18px;">${name}</div>
            <a href="${url}" style="display:block;width:100%;padding:12px 0;background:#6B4F4F;color:white;border-radius:8px;text-align:center;text-decoration:none;font-weight:600;font-size:1rem;transition:background 0.2s;box-shadow:0 1px 2px rgba(0,0,0,0.04);">View Details &rarr;</a>
          </div>
        `;
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        new mapboxgl.Popup({
          closeButton: false,
          className: 'custom-popup'
        })
          .setLngLat(coordinates)
          .setHTML(popupText)
          .addTo(map.current);
      });

      map.current.on("mouseenter", "clusters", () => {
        map.current.getCanvas().style.cursor = "pointer";
      });
      map.current.on("mouseleave", "clusters", () => {
        map.current.getCanvas().style.cursor = "";
      });
    });

    return () => {
      if (map.current) map.current.remove();
    };
  }, [mapContainer]);

  return { loading, mapLoaded, height };
}
