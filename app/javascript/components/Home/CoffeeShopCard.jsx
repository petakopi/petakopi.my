import React from "react"
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  TikTokIcon,
  WhatsAppIcon,
  GoogleIcon,
  StarIcon
} from "../Icons"

const CoffeeShopCard = ({ coffee_shop, tab = "explore" }) => {
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

  // Check if location exists
  const hasLocation = coffee_shop.district || coffee_shop.state;

  // Check if we're in the nearby tab
  const isNearbyTab = tab === "nearby";

  // Format distance if available
  const formatDistance = () => {
    if (coffee_shop.distance_in_km) {
      return `${coffee_shop.distance_in_km} km away`;
    }
    return "Distance unavailable";
  };

  // Format rating and rating count if available
  const formatRating = () => {
    if (coffee_shop.rating) {
      return (
        <div className="flex items-center">
          <StarIcon className="h-4 w-4 text-orange-500 mr-1" />
          <span>{coffee_shop.rating} ({coffee_shop.rating_count})</span>
        </div>
      );
    }
    return "";
  };

  return (
    <div
      key={`${coffee_shop.slug}`}
      id={`coffee-shop-${coffee_shop.slug}`}
      className="mb-4 border border-gray-200 rounded-lg bg-white overflow-hidden"
    >
      <div className="flex flex-col h-full">
        {/* Cover photo - now touching the borders */}
        <div className="w-full">
          {coffee_shop.cover_photo ? (
            <div className="w-full h-48 overflow-hidden">
              <a href={`/${coffee_shop.slug}`}>
                <img
                  src={coffee_shop.cover_photo}
                  alt={`${coffee_shop.name} cover`}
                  className="w-full h-full object-cover hover:opacity-90 transition-opacity duration-200"
                />
              </a>
            </div>
          ) : (
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
              <a href={`/coffee_shops/${coffee_shop.slug}`} className="block w-full h-full flex items-center justify-center hover:bg-gray-200 transition-colors duration-200">
                <div className="h-20 w-20 rounded-full flex items-center justify-center bg-gray-200">
                  <svg className="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </a>
            </div>
          )}
        </div>

        {/* Content area with padding */}
        <div className="p-4">
          <div className="flex-grow">
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex-shrink-0 h-10 w-10">
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
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">{coffee_shop.name}</h3>
                {hasLocation && (
                  <p className="text-sm text-gray-500">
                    {coffee_shop.district && <span>{coffee_shop.district}, </span>}
                    {coffee_shop.state}
                  </p>
                )}
              </div>
            </div>

            {coffee_shop.links && coffee_shop.links.length > 0 && (
              <div className="mt-6 mb-4">
                <div className="flex space-x-3.5 items-center">
                  {coffee_shop.links
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
              </div>
            )}
          </div>

          <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {formatRating()}
            </div>
            {isNearbyTab && (
              <div className="text-xs text-gray-500">
                <span>{formatDistance()}</span>
              </div>
            )}
            <a
              href={`/${coffee_shop.slug}`}
              className={`text-brown-600 text-sm hover:text-brown-900 ${isNearbyTab ? '' : 'ml-auto'}`}
            >
              View
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoffeeShopCard
