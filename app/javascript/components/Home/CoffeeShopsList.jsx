import React from "react"
import CoffeeShopCard from "./CoffeeShopCard"
import LoadingIndicator from "./LoadingIndicator"
import SkeletonCard from "../SkeletonCard"

const CoffeeShopsList = ({ 
  shops, 
  loading
}) => {
  if (loading && shops.length === 0) {
    return (
      <>
        {[...Array(6)].map((_, index) => (
          <SkeletonCard key={`skeleton-${index}`} />
        ))}
      </>
    )
  }

  return (
    <>
      {shops.map((coffee_shop, index) => (
        <CoffeeShopCard 
          key={`${coffee_shop.slug}-${index}`}
          coffee_shop={coffee_shop}
        />
      ))}

      {loading && shops.length > 0 && <LoadingIndicator />}


      {!loading && shops.length === 0 && (
        <div className="col-span-full">
          <p className="text-gray-500 text-center py-4">No coffee shops found</p>
        </div>
      )}
    </>
  )
}

export default CoffeeShopsList
