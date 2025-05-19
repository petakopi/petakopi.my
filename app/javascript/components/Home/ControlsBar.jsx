import React from "react"
import FilterPills from "./FilterPills"
import { getActiveFilterCount } from "../../utils/filters"

const ControlsBar = ({
  isFilterSidebarOpen,
  setIsFilterSidebarOpen,
  filters,
  setFilters,
  handleApplyFilters,
  locationPermission,
  onRequestLocation,
  viewType,
  setViewType,
  activeTab,
  collections = []
}) => {
  const activeFilterCount = getActiveFilterCount(filters);

  return (
    <div className="mt-1">
      <div className="flex flex-col space-y-4">
        {/* Top row: Filter button and view type controls */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* Filter button */}
            <button
              onClick={() => setIsFilterSidebarOpen(true)}
              className={`flex items-center justify-center h-10 w-10 rounded-lg transition-all relative ${
                activeFilterCount > 0
                  ? "bg-brown-100 text-brown-700"
                  : "bg-gray-100 text-gray-700 hover:text-brown-600 hover:bg-brown-50"
              }`}
              aria-label="Filter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brown-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* View type controls - only show when not in map view */}
            {activeTab !== 1 && (
              <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewType("card")}
                  className={`flex items-center px-3 py-1.5 text-sm rounded-md transition-all ${viewType === "card"
                    ? "bg-white text-brown-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Cards
                </button>
                <button
                  onClick={() => setViewType("list")}
                  className={`flex items-center px-3 py-1.5 text-sm rounded-md transition-all ${viewType === "list"
                    ? "bg-white text-brown-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  List
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom row: Filter pills */}
        <FilterPills
          filters={{ ...filters, collections }}
          setFilters={setFilters}
          handleApplyFilters={handleApplyFilters}
          locationPermission={locationPermission}
          onRequestLocation={onRequestLocation}
          activeTab={activeTab}
        />
      </div>
    </div>
  )
}

export default ControlsBar
