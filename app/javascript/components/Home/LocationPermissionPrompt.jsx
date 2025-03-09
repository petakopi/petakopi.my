import React from "react"

const LocationPermissionPrompt = ({ locationPermission, requestLocationPermission }) => {
  if (locationPermission !== "denied" && locationPermission !== "blocked") {
    return null
  }

  return (
    <div className="col-span-full text-center py-8">
      {locationPermission === "blocked" ? (
        <>
          <p className="text-gray-600 mb-4">
            Location access is blocked. Please enable location permissions in your browser settings.
          </p>
          <div className="bg-gray-100 p-4 rounded-lg max-w-md mx-auto text-left mb-4">
            <h4 className="font-medium mb-2">How to enable location:</h4>
            <ul className="list-disc pl-5 text-sm text-gray-600">
              <li>Click the lock/info icon in your browser's address bar</li>
              <li>Find "Location" or "Site settings"</li>
              <li>Change the permission to "Allow"</li>
              <li>Refresh the page</li>
            </ul>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-brown-500 text-white rounded hover:bg-brown-600"
          >
            Refresh Page
          </button>
        </>
      ) : (
        <>
          <p className="text-gray-600 mb-4">No nearby coffee shops, please share your location</p>
          <button 
            onClick={requestLocationPermission}
            className="px-4 py-2 bg-brown-500 text-white rounded hover:bg-brown-600"
          >
            Share Location
          </button>
        </>
      )}
    </div>
  )
}

export default LocationPermissionPrompt
