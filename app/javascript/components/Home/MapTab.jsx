import React, { useRef, useState } from "react";
import useMapbox from "./useMapbox";

export default function MapTab({
  activeTab,
  userLocation,
  height = '100vh',
  setIsFilterSidebarOpen,
  filters = {}
}) {
  const mapContainer = useRef(null);
  const { loading, mapLoaded } = useMapbox(mapContainer, height, activeTab === 1);

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
      {/* Filter button positioned at the top left */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => setIsFilterSidebarOpen(true)}
          className={`flex items-center justify-center h-10 w-10 rounded-lg transition-all shadow-md ${
            Object.keys(filters).length > 0
              ? "bg-brown-100 text-brown-700"
              : "bg-white text-gray-700 hover:text-brown-600 hover:bg-brown-50"
          }`}
          aria-label="Filter"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {Object.keys(filters).length > 0 && (
            <span className="absolute -top-2 -right-2 bg-brown-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
              {Object.keys(filters).length}
            </span>
          )}
        </button>
      </div>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex flex-col justify-center items-center rounded-lg z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-600"></div>
          <p className="mt-4 text-brown-600 font-medium">Loading map...</p>
        </div>
      )}
    </div>
  );
}
