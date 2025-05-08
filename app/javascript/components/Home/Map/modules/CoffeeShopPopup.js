import mapboxgl from "mapbox-gl";

export const createCoffeeShopPopup = (map, coordinates, { name, url, logo }) => {
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
        <div style="font-weight:700;font-size:1rem;color:#3d2c2c;text-align:center;margin-bottom:8px;">${name}</div>
        <div style="font-size:0.875rem;color:#6B4F4F;text-align:center;margin-bottom:18px;">
          <span style="color:#F59E0B;margin-right:4px;">★</span>
          <span style="font-weight:600;">4.5</span>
          <span style="color:#9CA3AF;margin:0 4px;">•</span>
          <span>120 reviews</span>
        </div>
        <a href="${url}" style="display:inline-block;padding:8px 16px;background:white;color:#6B4F4F;border:1px solid #6B4F4F;border-radius:6px;text-decoration:none;font-weight:600;font-size:0.875rem;transition:all 0.2s;box-shadow:0 1px 2px rgba(0,0,0,0.04);">View →</a>
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

  return popup;
};
