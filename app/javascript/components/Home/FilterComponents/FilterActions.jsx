import React from "react"

const FilterActions = ({
  onReset,
  isSubmitting,
  badgeColor = "bg-brown-500 hover:bg-brown-600",
}) => {
  return (
    <div className="fixed bottom-0 left-0 w-80 p-4 bg-white border-t border-gray-200 flex justify-between items-center">
      <button
        type="button"
        onClick={onReset}
        disabled={isSubmitting}
        className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
      >
        Reset
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className={`px-4 py-2 text-xs font-medium text-white border border-transparent rounded-md transition-colors duration-150 flex items-center ${badgeColor}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3.5 w-3.5 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        Apply Filters
      </button>
    </div>
  )
}

export default FilterActions
