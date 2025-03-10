import React from "react"
import CoffeeShopsList from "./CoffeeShopsList"

const EverywhereTab = ({
  everywhereShops,
  everywhereLoading
}) => {
  return (
    <CoffeeShopsList 
      shops={everywhereShops}
      loading={everywhereLoading}
    />
  )
}

export default EverywhereTab
