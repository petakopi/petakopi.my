import React from "react";

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

  return (
    <div className="flex flex-wrap gap-2 ml-4">
      {Object.entries(filters)
        .filter(([key, value]) => key !== "_timestamp" && value && value.length > 0)
        .map(([key, value]) => {
          // Handle array values (like tags), otherwise just show the value
          if (Array.isArray(value)) {
            return value.map((v) => (
              <span key={key + v} className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                {String(v).replace(/[-_]/g, ' ')}
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
          // For boolean or string values
          return (
            <span key={key} className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
              {key === 'opened' && String(value) === 'true' ? 'Open Now' : String(value).replace(/[-_]/g, ' ')}
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
        })}
    </div>
  );
}
