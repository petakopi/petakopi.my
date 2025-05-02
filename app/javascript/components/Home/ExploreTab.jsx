import React from "react"
import CoffeeShopsList from "./CoffeeShopsList"

const EverywhereTab = ({
  everywhereShops,
  everywhereLoading,
  viewType,
  userLocation
}) => {
  return (
    <CoffeeShopsList
      shops={everywhereShops}
      loading={everywhereLoading}
      viewType={viewType}
      tab="explore"
      userLocation={userLocation}
    />
  )
}

export default EverywhereTab
