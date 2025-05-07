import { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl";

const DEFAULT_CENTER = [101.7117, 3.1578]; // KLCC coordinates
const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoiYW1yZWV6IiwiYSI6ImNsMDN3bW5rZDBidGYzZHBpdmZjMDVpbzkifQ.F8fdxihnLv9ZTuDjufmICQ";
const GEOJSON_URL = "/mapbox?type=geojson";

export default function useMapbox(mapContainer, height = "100vh") {
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

    // Just make sure the container has the right dimensions
    // but let the parent component control the positioning
    if (mapContainer.current) {
      mapContainer.current.style.width = "100%";
      mapContainer.current.style.height = "100%";
      mapContainer.current.style.margin = "0";
      mapContainer.current.style.padding = "0";
      mapContainer.current.style.overflow = "hidden";
    }

    // Add custom styles for map container
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

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.current.addControl(new mapboxgl.FullscreenControl(), "top-right");
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
    });
    map.current.addControl(geolocate, "top-right");

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
        map.current
          .getSource("coffee_shops")
          .getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;
            map.current.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom,
            });
          });
      });

      // Popup for unclustered points
      map.current.on("click", "unclustered-point", (e) => {
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

        // Create and add the new popup
        const popup = new mapboxgl.Popup({
          closeButton: true,
          closeOnClick: false,
          className: "custom-popup",
          maxWidth: "300px",
        })
          .setLngLat(coordinates)
          .setHTML(
            `
            <div style="min-width:200px;max-width:260px;padding:20px 18px 18px 18px;background:white;border-radius:18px;box-shadow:0 4px 24px rgba(0,0,0,0.10);display:flex;flex-direction:column;align-items:center;position:relative;">
              <img src="${logo}" alt="${name} logo" style="width:64px;height:64px;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.10);object-fit:cover;margin-bottom:16px;border:2px solid #6B4F4F;" />
              <div style="font-weight:700;font-size:1.15rem;color:#3d2c2c;text-align:center;margin-bottom:18px;">${name}</div>
              <a href="${url}" style="display:block;width:100%;padding:12px 0;background:white;color:#6B4F4F;border:2px solid #6B4F4F;border-radius:8px;text-align:center;text-decoration:none;font-weight:600;font-size:1rem;transition:all 0.2s;box-shadow:0 1px 2px rgba(0,0,0,0.04);">View Details &rarr;</a>
            </div>
          `,
          )
          .addTo(map.current);

        // Add custom styles to the document
        const style = document.createElement("style");
        style.textContent = `
          .mapboxgl-popup {
            background: none !important;
            border: none !important;
            box-shadow: none !important;
          }
          .mapboxgl-popup-content {
            padding: 0 !important;
            background: none !important;
            border: none !important;
            box-shadow: none !important;
          }
          .mapboxgl-popup-close-button {
            font-size: 24px !important;
            padding: 8px !important;
            color: #6B4F4F !important;
            font-weight: bold !important;
            line-height: 1 !important;
            right: 8px !important;
            top: 8px !important;
            border: none !important;
            background: none !important;
            cursor: pointer !important;
            width: 32px !important;
            height: 32px !important;
            margin: 0 !important;
            position: absolute !important;
            z-index: 1 !important;
            font-family: Arial, sans-serif !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: color 0.2s !important;
          }
          .mapboxgl-popup-close-button:hover {
            color: #8B6B6B !important;
          }
        `;
        document.head.appendChild(style);

        // Style the popup content
        popup.on("open", () => {
          const popupElement = document.querySelector(".mapboxgl-popup");
          if (popupElement) {
            const closeButton = popupElement.querySelector(
              ".mapboxgl-popup-close-button",
            );
            if (closeButton) {
              closeButton.innerHTML = "×";
            }

            const popupContent = popupElement.querySelector(
              ".mapboxgl-popup-content",
            );
            if (popupContent) {
              popupContent.style.padding = "0";
              popupContent.style.borderRadius = "18px";
              popupContent.style.overflow = "hidden";
            }
          }
        });
      });

      // Add click handler to close popup when clicking outside
      map.current.on("click", (e) => {
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ["unclustered-point"],
        });

        // If we didn't click on a point, close the popup
        if (features.length === 0) {
          const popup = document.querySelector(".mapboxgl-popup");
          if (popup) {
            popup.remove();
          }
        }
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
