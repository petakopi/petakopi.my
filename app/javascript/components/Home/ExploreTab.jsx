import React from "react"
import CoffeeShopsList from "./CoffeeShopsList"

const ExploreTab = ({
  everywhereShops,
  everywhereLoading,
  viewType,
  userLocation,
}) => {
  return (
    <div>
      <CoffeeShopsList
        shops={everywhereShops}
        loading={everywhereLoading}
        viewType={viewType}
        tab="explore"
        userLocation={userLocation}
      />
    </div>
  )
}

export default ExploreTab
