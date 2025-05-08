import mapboxgl from "mapbox-gl";

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
      .addTo(map);

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
