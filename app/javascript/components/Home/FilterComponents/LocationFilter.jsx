import React, { useState } from "react"
import { useDistricts } from "../../../hooks/useFilters"

const LocationFilter = ({
  selectedState,
  selectedDistrict,
  onStateChange,
  onDistrictChange,
  states,
  isLoadingStates,
  stateError
}) => {
  const [isStateOpen, setIsStateOpen] = useState(false)
  const [isDistrictOpen, setIsDistrictOpen] = useState(false)

  // Use React Query for districts
  const {
    data: districts = [],
    isLoading: isLoadingDistricts,
    error: districtError,
  } = useDistricts(selectedState)

  const districtErrorMessage = districtError ? "Failed to load districts. Please try again later." : null

  return (
    <div className="space-y-4">
      {/* State Dropdown */}
      <div>
        <label htmlFor="state" className="block text-xs font-medium text-gray-700 mb-1">
          State
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsStateOpen(!isStateOpen)}
            className="w-full px-3 py-2 text-left text-xs bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500"
            disabled={isLoadingStates}
          >
            {isLoadingStates ? "Loading states..." : selectedState || "Select a state"}
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>

          {isStateOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-xs ring-1 ring-black ring-opacity-5 overflow-auto">
              {stateError ? (
                <div className="text-red-500 p-2 text-center">{stateError}</div>
              ) : (
                <>
                  <div
                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                    onClick={() => {
                      onStateChange(null)
                      onDistrictChange(null)
                      setIsStateOpen(false)
                    }}
                  >
                    No preference
                  </div>
                  {states.map((state) => (
                    <div
                      key={state}
                      className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 ${
                        state === selectedState ? 'bg-brown-100 text-brown-900' : ''
                      }`}
                      onClick={() => {
                        onStateChange(state)
                        onDistrictChange(null)
                        setIsStateOpen(false)
                      }}
                    >
                      {state}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* District Dropdown (only shown if state is selected) */}
      {selectedState && (
        <div>
          <label htmlFor="district" className="block text-xs font-medium text-gray-700 mb-1">
            District
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDistrictOpen(!isDistrictOpen)}
              className="w-full px-3 py-2 text-left text-xs bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500"
              disabled={isLoadingDistricts || districts.length === 0}
            >
              {isLoadingDistricts
                ? "Loading districts..."
                : selectedDistrict || (districts.length === 0 ? "No districts available" : "Select a district")}
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>

            {isDistrictOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-xs ring-1 ring-black ring-opacity-5 overflow-auto">
                {districtErrorMessage ? (
                  <div className="text-red-500 p-2 text-center">{districtErrorMessage}</div>
                ) : districts.length === 0 ? (
                  <div className="p-2 text-center text-gray-500">No districts available</div>
                ) : (
                  <>
                    <div
                      className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                      onClick={() => {
                        onDistrictChange(null)
                        setIsDistrictOpen(false)
                      }}
                    >
                      No preference
                    </div>
                    {districts.map((district) => (
                      <div
                        key={district}
                        className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 ${
                          district === selectedDistrict ? 'bg-brown-100 text-brown-900' : ''
                        }`}
                        onClick={() => {
                          onDistrictChange(district)
                          setIsDistrictOpen(false)
                        }}
                      >
                        {district}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default LocationFilter
