import React from "react"

const MapStyles = () => {
  return (
    <style>{`
      .locate-me-button {
        margin-top: 10px;
      }

      .locate-me-button button {
        padding: 6px;
        background: #fff;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .locate-me-button button:hover {
        background: #f0f0f0;
      }

      .filter-control {
        margin-top: 10px;
        margin-left: 10px;
        padding: 5px;
      }

      .filter-select {
        padding: 5px 10px;
        border: none;
        border-radius: 2px;
        font-size: 12px;
        font-family: inherit;
        background-color: white;
        cursor: pointer;
      }

      /* Fix for fullscreen button on mobile */
      .mapboxgl-ctrl-fullscreen {
        display: block !important;
      }

      /* Ensure controls are visible on mobile */
      @media (max-width: 640px) {
        .mapboxgl-ctrl-top-right {
          display: flex !important;
          flex-direction: column;
        }

        .mapboxgl-ctrl-top-right .mapboxgl-ctrl {
          margin: 10px 10px 0 0 !important;
          display: block !important;
        }
      }

      .coffee-shop-popup .mapboxgl-popup-content {
        padding: 0;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      }

      .coffee-shop-popup .mapboxgl-popup-close-button {
        font-size: 16px;
        color: white;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 50%;
        width: 24px;
        height: 24px;
        line-height: 22px;
        text-align: center;
        top: 8px;
        right: 8px;
        padding: 0;
      }

      .coffee-shop-popup .mapboxgl-popup-close-button:hover {
        background: rgba(0, 0, 0, 0.5);
      }

      .map-error-message {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #f44336;
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        z-index: 9999;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      }

      @keyframes highlight-pulse {
        0% { box-shadow: 0 0 0 0 rgba(139, 69, 19, 0.7); border: none; }
        50% { box-shadow: 0 0 0 10px rgba(139, 69, 19, 0.4); border: none; }
        100% { box-shadow: 0 0 0 0 rgba(139, 69, 19, 0); border: none; }
      }

      @keyframes jump {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }

      .jump-dot {
        animation: jump 0.6s infinite;
      }

      .card-highlight-animation {
        animation: highlight-pulse 1.5s ease-out;
        animation-iteration-count: 2;
        border: none !important;
      }
    `}</style>
  )
}

export default MapStyles
