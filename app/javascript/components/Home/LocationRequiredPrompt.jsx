import React from "react"

const LocationRequiredPrompt = ({ onRequestLocation }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Location Required
        </h3>
        <p className="text-gray-600 mb-4">
          To filter coffee shops by distance, we need your location. Your location will only be used to find coffee shops near you.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => onRequestLocation()}
            className="px-4 py-2 bg-brown-500 text-white rounded hover:bg-brown-600"
          >
            Share Location
          </button>
        </div>
      </div>
    </div>
  )
}

export default LocationRequiredPrompt
