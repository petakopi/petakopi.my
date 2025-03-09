import React from "react"
import CoffeeShopsList from "./CoffeeShopsList"

const EverywhereTab = ({
  everywhereShops,
  everywhereLoading,
  everywhereHasMore,
  lastEverywhereElementRef
}) => {
  return (
    <CoffeeShopsList 
      shops={everywhereShops}
      loading={everywhereLoading}
      hasMore={everywhereHasMore}
      lastElementRef={lastEverywhereElementRef}
    />
  )
}

export default EverywhereTab
