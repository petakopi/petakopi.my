import React from "react";
import LocationPill from "./LocationPill";

// Filter configurations
const FILTER_CONFIGS = {
  keyword: {
    label: "Search",
    formatValue: (value) => value,
    shouldShow: (value) => value !== null && value !== undefined && value.trim() !== '',
    order: 0
  },
  location: {
    label: "Location",
    shouldShow: (value) => true,
    order: 1
  },
  distance: {
    label: "Distance",
    formatValue: (value) => `${value}km`,
    shouldShow: (value) => value !== null && value !== undefined,
    order: 2
  },
  opened: {
    label: "Opening Hours",
    formatValue: (value) => value === "true" ? "Open Now" : value,
    shouldShow: (value) => value === "true",
    order: 3
  },
  state: {
    label: "State",
    formatValue: (value) => value.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' '),
    shouldShow: (value) => value !== null && value !== undefined,
    order: 4
  },
  district: {
    label: "District",
    formatValue: (value) => value.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' '),
    shouldShow: (value) => value !== null && value !== undefined,
    order: 4
  },
  tags: {
    label: "Tags",
    formatValue: (value) => value.split(/[-_]/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' '),
    shouldShow: (value) => Array.isArray(value) && value.length > 0,
    order: 5
  }
};

export default function FilterPills({ filters, setFilters, handleApplyFilters, locationPermission, onRequestLocation, activeTab }) {
  // Handler to remove a filter or tag
  const handleRemove = (removeKey, removeValue = null) => {
    setFilters(prev => {
      const updated = { ...prev };

      // Handle array values (like tags)
      if (Array.isArray(updated[removeKey]) && removeValue !== null) {
        updated[removeKey] = updated[removeKey].filter(v => v !== removeValue);
        if (updated[removeKey].length === 0) {
          delete updated[removeKey];
        }
      } else {
        // Handle non-array values
        delete updated[removeKey];
      }

      // If removing state, also remove district
      if (removeKey === 'state') {
        delete updated['district'];
      }

      // Remove timestamp to force a fresh fetch
      delete updated['_timestamp'];

      // Re-apply filters with the updated state
      handleApplyFilters(updated);
      return updated;
    });
  };

  // Render a single filter pill
  const renderFilterPill = (key, value, config) => {
    if (Array.isArray(value)) {
      return value.map((v) => (
        <span key={`${key}-${v}`} className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
          {config.formatValue(v)}
          <button
            type="button"
            aria-label={`Remove ${v}`}
            className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
            onClick={() => handleRemove(key, v)}
          >
            ×
          </button>
        </span>
      ));
    }

    if (key === 'location') {
      if (activeTab === 1) return null;
      return <LocationPill key="location-pill" locationPermission={locationPermission} onRequestLocation={onRequestLocation} />;
    }

    // Custom styling for distance filter
    const pillStyle = key === 'distance'
      ? "bg-green-100 text-green-700"
      : "bg-gray-200 text-gray-700";

    return (
      <span key={`${key}-${value}`} className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${pillStyle}`}>
        {config.formatValue(value)}
        <button
          type="button"
          aria-label={`Remove ${value}`}
          className={`ml-1 ${key === 'distance' ? 'text-green-500 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'} focus:outline-none`}
          onClick={() => handleRemove(key)}
        >
          ×
        </button>
      </span>
    );
  };

  // Create a new filters object that includes location status
  const filtersWithLocation = {
    location: locationPermission,
    ...filters
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Only render Location pill if not in map view */}
      {activeTab !== 1 && renderFilterPill('location', locationPermission, FILTER_CONFIGS.location)}

      {/* Render other filter pills */}
      {Object.entries(filters)
        .filter(([key, value]) => {
          if (key === "_timestamp") return false;
          const config = FILTER_CONFIGS[key];
          return config && config.shouldShow(value);
        })
        .sort(([keyA], [keyB]) => {
          const orderA = FILTER_CONFIGS[keyA]?.order || 999;
          const orderB = FILTER_CONFIGS[keyB]?.order || 999;
          return orderA - orderB;
        })
        .map(([key, value]) => {
          const config = FILTER_CONFIGS[key];
          return renderFilterPill(key, value, config);
        })}
    </div>
  );
}
