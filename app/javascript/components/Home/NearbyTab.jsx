import React from "react"
import CoffeeShopsList from "./CoffeeShopsList"
import DistanceSelector from "./DistanceSelector"
import LocationPermissionPrompt from "./LocationPermissionPrompt"
import LoadingIndicator from "./LoadingIndicator"

const NearbyTab = ({
  nearbyShops,
  nearbyLoading,
  locationPermission,
  requestLocationPermission,
  selectedDistance,
  handleDistanceChange
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
        <>
          <DistanceSelector
            selectedDistance={selectedDistance}
            handleDistanceChange={handleDistanceChange}
            disabled={nearbyLoading && nearbyShops.length === 0}
          />

          <CoffeeShopsList
            shops={nearbyShops}
            loading={nearbyLoading}
          />
        </>
      )}
    </>
  )
}

export default NearbyTab
