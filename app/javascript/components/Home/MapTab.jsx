import React, { useRef } from "react";
import useMapbox from "./useMapbox";

export default function MapTab({ activeTab, userLocation, height = '100vh' }) {
  const mapContainer = useRef(null);
  const { loading, mapLoaded } = useMapbox(mapContainer, height);

  return (
    <div style={{
      width: '100%',
      height: 'calc(100vh - 4.5rem)',
      position: 'fixed',
      top: '4.5rem',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 0,
      pointerEvents: 'auto',
      marginTop: '0'
    }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex flex-col justify-center items-center rounded-lg z-10">
          <div className="flex space-x-2 mb-4">
            <div className="w-2 h-2 bg-brown-500 rounded-full jump-dot" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-brown-500 rounded-full jump-dot" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-brown-500 rounded-full jump-dot" style={{ animationDelay: '300ms' }}></div>
          </div>
          <p className="text-brown-700 font-medium">
            {mapLoaded ? 'Loading coffee shops...' : 'Initializing map...'}
          </p>
        </div>
      )}
    </div>
  );
}
