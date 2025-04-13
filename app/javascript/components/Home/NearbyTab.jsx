import React from "react"
import CoffeeShopsList from "./CoffeeShopsList"
import LocationPermissionPrompt from "./LocationPermissionPrompt"
import LoadingIndicator from "./LoadingIndicator"

const NearbyTab = ({
  nearbyShops,
  nearbyLoading,
  locationPermission,
  requestLocationPermission,
  viewType
}) => {
  // Show loading indicator when we're waiting for location permission
  if (locationPermission === "prompt") {
    return (
      <div className="col-span-full text-center py-8">
        <p className="text-gray-600 mb-4">Getting your location...</p>
        <LoadingIndicator />
      </div>
    )
  }

  // Show timeout message when location request times out
  if (locationPermission === "timeout") {
    return (
      <div className="col-span-full text-center py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 max-w-md mx-auto">
          <h3 className="text-yellow-800 font-medium mb-2">Location request timed out</h3>
          <p className="text-yellow-700 mb-4">
            We couldn't get your location after several attempts. This might be due to:
          </p>
          <ul className="list-disc pl-5 text-sm text-yellow-700 mb-4">
            <li>Slow internet connection</li>
            <li>Browser location services issues</li>
            <li>Location permission dialog not appearing</li>
          </ul>
        </div>
        <button
          onClick={requestLocationPermission}
          className="px-4 py-2 bg-brown-500 text-white rounded hover:bg-brown-600 mr-2"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
        >
          Refresh Page
        </button>
      </div>
    )
  }

  return (
    <>
      <LocationPermissionPrompt
        locationPermission={locationPermission}
        requestLocationPermission={requestLocationPermission}
      />

      {(locationPermission !== "denied" && locationPermission !== "blocked" && locationPermission !== "timeout") && (
        <CoffeeShopsList
          shops={nearbyShops}
          loading={nearbyLoading}
          viewType={viewType}
          tab="nearby"
        />
      )}
    </>
  )
}

export default NearbyTab
