import React from "react"
import CoffeeShopCard from "./CoffeeShopCard"
import LoadingIndicator from "./LoadingIndicator"
import SkeletonCard from "../SkeletonCard"

const CoffeeShopsList = ({
  shops,
  loading,
  viewType = "card" // Default to card view
}) => {
  if (loading && shops.length === 0) {
    if (viewType === "list") {
      // List view skeleton
      return (
        <div className="col-span-full">
          <div className="overflow-hidden bg-white shadow sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {[...Array(6)].map((_, index) => (
                <li key={`skeleton-list-${index}`} className="animate-pulse">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-40"></div>
                      </div>
                      <div className="flex items-center">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <div className="h-3 bg-gray-200 rounded w-32 mt-2"></div>
                      </div>
                      <div className="mt-2 sm:mt-0">
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    } else {
      // Card view skeleton
      return (
        <>
          {[...Array(6)].map((_, index) => (
            <SkeletonCard key={`skeleton-card-${index}`} />
          ))}
        </>
      );
    }
  }

  // Render list view
  const renderListView = () => {
    return (
      <div className="col-span-full">
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {shops.map((coffee_shop, index) => (
              <li key={`${coffee_shop.slug}-${index}`}>
                <a href={`/coffee_shops/${coffee_shop.slug}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {coffee_shop.logo && coffee_shop.logo !== "" && (
                          <img
                            src={coffee_shop.logo}
                            alt={`${coffee_shop.name} logo`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                        <p className="font-medium text-brown-600">{coffee_shop.name}</p>
                      </div>
                      <div className="flex items-center">
                        {coffee_shop.district && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {coffee_shop.district}
                          </span>
                        )}
                        <svg className="ml-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {coffee_shop.state || 'Location not specified'}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          Updated: {new Date(coffee_shop.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  // Render card view (original view)
  const renderCardView = () => {
    return (
      <>
        {shops.map((coffee_shop, index) => (
          <CoffeeShopCard 
            key={`${coffee_shop.slug}-${index}`}
            coffee_shop={coffee_shop}
          />
        ))}
      </>
    );
  };

  return (
    <>
      {viewType === "list" ? renderListView() : renderCardView()}

      {loading && shops.length > 0 && (
        <div className="col-span-full text-center py-4">
          <LoadingIndicator />
        </div>
      )}

      {!loading && shops.length === 0 && (
        <div className="col-span-full">
          <p className="text-gray-500 text-center py-4">No coffee shops found</p>
        </div>
      )}
    </>
  )
}

export default CoffeeShopsList
