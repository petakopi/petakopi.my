import React from "react"
import CoffeeShopCard from "./CoffeeShopCard"
import LoadingIndicator from "./LoadingIndicator"
import SkeletonCard from "../SkeletonCard"
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  TikTokIcon,
  WhatsAppIcon,
  GoogleIcon
} from "../Icons"
import VerifiedIcon from "../Icons/VerifiedIcon"

const CoffeeShopsList = ({
  shops,
  loading,
  viewType = "card", // Default to card view
  tab = "explore" // Default to explore tab
}) => {
  // Function to get the appropriate icon based on link name
  const getLinkIcon = (linkName) => {
    const name = linkName.toLowerCase();
    switch (name) {
      case 'facebook':
        return <FacebookIcon />;
      case 'instagram':
        return <InstagramIcon />;
      case 'twitter':
        return <TwitterIcon />;
      case 'tiktok':
        return <TikTokIcon />;
      case 'whatsapp':
        return <WhatsAppIcon />;
      case 'google':
        return <GoogleIcon />;
      default:
        return null;
    }
  };

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
            {shops.map((coffee_shop, index) => {
              // Check if location exists
              const hasLocation = coffee_shop.district || coffee_shop.state;

              return (
                <li key={`${coffee_shop.slug}-${index}`} className="px-4 py-4 sm:px-6 bg-white">
                  <div className="flex w-full items-center justify-between space-x-6">
                    <div className="flex-1 truncate">
                      <div className="flex items-center space-x-3">
                        <h3 className="truncate text-sm font-medium text-gray-900 flex items-center">
                          <a href={`/coffee_shops/${coffee_shop.slug}`}>
                            {coffee_shop.name}
                          </a>
                          {coffee_shop.has_owner && (
                            <span className="ml-1 inline-flex items-center">
                              <VerifiedIcon className="w-4 h-4" />
                            </span>
                          )}
                        </h3>
                      </div>
                      {hasLocation && (
                        <p className="mt-1 truncate text-sm text-gray-500">
                          {coffee_shop.district && coffee_shop.district_url ? (
                            <span>
                              <a href={coffee_shop.district_url} className="text-brown-600 hover:text-brown-900">
                                {coffee_shop.district},
                              </a>
                            </span>
                          ) : (
                            <span>{coffee_shop.district}, </span>
                          )}
                          &nbsp;
                          {coffee_shop.state && coffee_shop.state_url ? (
                            <a href={coffee_shop.state_url} className="text-brown-600 hover:text-brown-900">
                              {coffee_shop.state}
                            </a>
                          ) : (
                            <span>{coffee_shop.state}</span>
                          )}
                        </p>
                      )}
                    </div>
                    <a href={`/coffee_shops/${coffee_shop.slug}`}>
                      {coffee_shop.logo && coffee_shop.logo !== "" ? (
                        <img
                          src={coffee_shop.logo}
                          alt={`${coffee_shop.name} logo`}
                          className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-300 border border-brown"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gray-200">
                          <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </a>
                  </div>

                  {coffee_shop.links && coffee_shop.links.length > 0 && (
                    <div className="text-sm text-gray-500 mt-8">
                      <div className="flex space-x-3.5 items-center">
                        {coffee_shop.links
                          .filter(link => link.url)
                          .map((link, i) => (
                            <span key={i} onClick={(e) => e.stopPropagation()}>
                              <a
                                href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-gray-900"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {getLinkIcon(link.name)}
                              </a>
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  };

  // Render desktop table view
  const renderDesktopTableView = () => {
    return (
      <div className="hidden sm:block col-span-full">
        <div className="mt-4 flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="bg-white divide-y divide-gray-200">
                    {shops.map((coffee_shop, index) => {
                      // Check if location exists
                      const hasLocation = coffee_shop.district || coffee_shop.state;

                      return (
                        <tr key={`desktop-${coffee_shop.slug}-${index}`} className="bg-white">
                          <td className="px-6 py-4 sticky sm:static left-0 z-0 min-w-[220px]">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <a href={`/coffee_shops/${coffee_shop.slug}`}>
                                  {coffee_shop.logo && coffee_shop.logo !== "" ? (
                                    <img
                                      src={coffee_shop.logo}
                                      alt={`${coffee_shop.name} logo`}
                                      className="h-10 w-10 rounded-full border border-brown"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gray-200">
                                      <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                  )}
                                </a>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 flex items-center">
                                  <a href={`/coffee_shops/${coffee_shop.slug}`}>
                                    {coffee_shop.name}
                                    {coffee_shop.has_owner && (
                                      <span className="ml-1 inline-flex items-center">
                                        <VerifiedIcon className="w-4 h-4" />
                                      </span>
                                    )}
                                  </a>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {hasLocation && (
                              <div className="text-sm text-gray-900">
                                {coffee_shop.district && coffee_shop.district_url ? (
                                  <span>
                                    <a href={coffee_shop.district_url} className="text-brown-600 hover:text-brown-900">
                                      {coffee_shop.district},
                                    </a>
                                  </span>
                                ) : (
                                  <span>{coffee_shop.district}, </span>
                                )}
                                &nbsp;
                                {coffee_shop.state && coffee_shop.state_url ? (
                                  <a href={coffee_shop.state_url} className="text-brown-600 hover:text-brown-900">
                                    {coffee_shop.state}
                                  </a>
                                ) : (
                                  <span>{coffee_shop.state}</span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2 items-center">
                              {coffee_shop.links && coffee_shop.links
                                .filter(link => link.url)
                                .map((link, i) => (
                                  <span key={i}>
                                    <a
                                      href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-gray-600 hover:text-gray-900"
                                    >
                                      {getLinkIcon(link.name)}
                                    </a>
                                  </span>
                                ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <a href={`/coffee_shops/${coffee_shop.slug}`} className="text-brown-600 hover:text-brown-900">
                              View
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
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
            tab={tab}
          />
        ))}
      </>
    );
  };

  return (
    <>
      {shops.length > 0 ? (
        viewType === "list" ? (
          <>
            <div className="sm:hidden">{renderListView()}</div>
            {renderDesktopTableView()}
          </>
        ) : renderCardView()
      ) : (
        <div className="col-span-full">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No coffee shops found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search criteria</p>
          </div>
        </div>
      )}

      {loading && shops.length > 0 && (
        <div className="col-span-full text-center py-4">
          <LoadingIndicator />
        </div>
      )}
    </>
  )
}

export default CoffeeShopsList
