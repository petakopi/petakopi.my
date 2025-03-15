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

  return (
    <>
      <LocationPermissionPrompt
        locationPermission={locationPermission}
        requestLocationPermission={requestLocationPermission}
      />

      {(locationPermission !== "denied" && locationPermission !== "blocked") && (
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
