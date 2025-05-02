import React from "react";

// Filter configurations
const FILTER_CONFIGS = {
  distance: {
    label: "Distance",
    formatValue: (value) => `${value}km`,
    shouldShow: (value) => value !== null && value !== undefined
  },
  opened: {
    label: "Opening Hours",
    formatValue: (value) => value === "true" ? "Open Now" : value,
    shouldShow: (value) => value === "true"
  },
  state: {
    label: "State",
    formatValue: (value) => value,
    shouldShow: (value) => value !== null && value !== undefined
  },
  district: {
    label: "District",
    formatValue: (value) => value,
    shouldShow: (value) => value !== null && value !== undefined
  },
  tags: {
    label: "Tags",
    formatValue: (value) => value.replace(/[-_]/g, ' '),
    shouldShow: (value) => Array.isArray(value) && value.length > 0
  }
};

export default function FilterPills({ filters, setFilters, handleApplyFilters }) {
  // Handler to remove a filter or tag
  const handleRemove = (removeKey, removeValue = null) => {
    setFilters(prev => {
      const updated = { ...prev };
      if (removeKey === 'state') {
        // Also remove district if state is removed
        delete updated['district'];
      }
      if (Array.isArray(updated[removeKey]) && removeValue !== null) {
        updated[removeKey] = updated[removeKey].filter(v => v !== removeValue);
        if (updated[removeKey].length === 0) delete updated[removeKey];
      } else {
        delete updated[removeKey];
      }
      // Re-apply filters
      handleApplyFilters(updated);
      return updated;
    });
  };

  // Render a single filter pill
  const renderFilterPill = (key, value, config) => {
    if (Array.isArray(value)) {
      return value.map((v) => (
        <span key={key + v} className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
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

    return (
      <span key={key} className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
        {config.formatValue(value)}
        <button
          type="button"
          aria-label={`Remove ${value}`}
          className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
          onClick={() => handleRemove(key)}
        >
          ×
        </button>
      </span>
    );
  };

  return (
    <div className="flex flex-wrap gap-2 ml-4">
      {Object.entries(filters)
        .filter(([key, value]) => {
          if (key === "_timestamp") return false;
          const config = FILTER_CONFIGS[key];
          return config && config.shouldShow(value);
        })
        .map(([key, value]) => {
          const config = FILTER_CONFIGS[key];
          return renderFilterPill(key, value, config);
        })}
    </div>
  );
}
