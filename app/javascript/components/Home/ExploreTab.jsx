import React from "react"
import CoffeeShopsList from "./CoffeeShopsList"

const EverywhereTab = ({
  everywhereShops,
  everywhereLoading,
  viewType
}) => {
  return (
    <CoffeeShopsList 
      shops={everywhereShops}
      loading={everywhereLoading}
      viewType={viewType}
      tab="explore"
    />
  )
}

export default EverywhereTab
