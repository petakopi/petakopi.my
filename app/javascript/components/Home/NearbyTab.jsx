import React from "react"
import CoffeeShopsList from "./CoffeeShopsList"
import DistanceSelector from "./DistanceSelector"
import LocationPermissionPrompt from "./LocationPermissionPrompt"

const NearbyTab = ({
  nearbyShops,
  nearbyLoading,
  nearbyHasMore,
  lastNearbyElementRef,
  locationPermission,
  requestLocationPermission,
  selectedDistance,
  handleDistanceChange
}) => {
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
            hasMore={nearbyHasMore}
            lastElementRef={lastNearbyElementRef}
          />
        </>
      )}
    </>
  )
}

export default NearbyTab
