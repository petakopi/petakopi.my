import React from "react"
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  TikTokIcon,
  WhatsAppIcon,
  GoogleIcon,
  StarIcon,
  PinIcon,
  VerifiedIcon,
} from "../Icons"
import { calculateDistance } from "../../utils/distance"

const CoffeeShopCard = ({
  coffee_shop,
  tab = "explore",
  userLocation = null,
}) => {
  // Function to get the appropriate icon based on link name
  const getLinkIcon = (linkName) => {
    const name = linkName.toLowerCase()
    switch (name) {
      case "facebook":
        return <FacebookIcon />
      case "instagram":
        return <InstagramIcon />
      case "twitter":
        return <TwitterIcon />
      case "tiktok":
        return <TikTokIcon />
      case "whatsapp":
        return <WhatsAppIcon />
      case "google":
        return <GoogleIcon />
      default:
        return null
    }
  }

  // Check if location exists
  const hasLocation = coffee_shop.district || coffee_shop.state

  // Check if we're in the nearby tab
  const isNearbyTab = tab === "nearby"

  // Calculate and format distance
  const getDistance = () => {
    if (!userLocation || !coffee_shop.lat || !coffee_shop.lng) return null
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      coffee_shop.lat,
      coffee_shop.lng
    )
    return `${distance}km`
  }

  // Format rating and rating count if available
  const formatRating = () => {
    if (coffee_shop.rating) {
      return (
        <div className="absolute top-2 right-2 bg-white bg-opacity-60 rounded-full px-2 py-1 flex items-center shadow-sm">
          <StarIcon className="h-3.5 w-3.5 text-orange-500 mr-1" />
          <span className="text-xs font-medium">
            {coffee_shop.rating} ({coffee_shop.rating_count})
          </span>
        </div>
      )
    }
    return null
  }

  return (
    <div
      key={`${coffee_shop.slug}`}
      id={`coffee-shop-${coffee_shop.slug}`}
      className={`mb-4 border border-gray-200 rounded-lg overflow-hidden ${
        coffee_shop.is_premium ? "bg-yellow-50" : "bg-white"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Cover photo - now touching the borders */}
        <div className="w-full relative">
          {coffee_shop.cover_photo ? (
            <div className="w-full aspect-[4/3] overflow-hidden">
              <a href={`/${coffee_shop.slug}`}>
                <img
                  src={coffee_shop.cover_photo}
                  alt={`${coffee_shop.name} cover`}
                  className="w-full h-full object-cover hover:opacity-90 transition-opacity duration-200"
                />
              </a>
              {/* Rating pill positioned at top right of cover image */}
              {coffee_shop.rating && formatRating()}
              {/* Logo positioned at bottom left of cover image */}
              {coffee_shop.logo && coffee_shop.logo !== "" && (
                <div className="absolute bottom-2 left-2">
                  <div className="h-10 w-10 drop-shadow-xl">
                    <img
                      src={coffee_shop.logo}
                      alt={`${coffee_shop.name} logo`}
                      className="h-10 w-10 rounded-full border-2 border-white shadow-lg"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full aspect-[4/3] bg-gray-100 flex items-center justify-center relative">
              <a
                href={`/coffee_shops/${coffee_shop.slug}`}
                className="block w-full h-full flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
              >
                <div className="h-20 w-20 rounded-full flex items-center justify-center bg-gray-200">
                  <svg
                    className="h-12 w-12 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </a>
              {/* Rating pill positioned at top right of cover image */}
              {coffee_shop.rating && formatRating()}
              {/* Logo positioned at bottom left of cover image */}
              {coffee_shop.logo && coffee_shop.logo !== "" && (
                <div className="absolute bottom-2 left-2">
                  <div className="h-10 w-10 drop-shadow-xl">
                    <img
                      src={coffee_shop.logo}
                      alt={`${coffee_shop.name} logo`}
                      className="h-10 w-10 rounded-full border-2 border-white shadow-lg"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content area with padding */}
        <div className="p-4">
          <div className="flex-grow">
            <div className="flex items-center space-x-3 mb-2">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  <span className="flex items-center">
                    <a
                      href={`/${coffee_shop.slug}`}
                      className="hover:text-brown-600"
                    >
                      {coffee_shop.name}
                    </a>
                    {coffee_shop.has_owner && (
                      <span className="ml-1 inline-flex items-center">
                        <VerifiedIcon
                          className="w-4 h-4"
                          isPremium={coffee_shop.is_premium}
                        />
                      </span>
                    )}
                  </span>
                </h3>
                <p className="text-sm text-gray-500 h-5 mt-1.5">
                  {hasLocation ? (
                    <span className="inline-flex items-center">
                      <PinIcon className="h-3.5 w-3.5 text-gray-400 mr-1" />
                      {coffee_shop.district && coffee_shop.district_url ? (
                        <span>
                          <a
                            href={coffee_shop.district_url}
                            className="text-brown-600 hover:text-brown-900"
                          >
                            {coffee_shop.district},
                          </a>
                        </span>
                      ) : (
                        <span>{coffee_shop.district}, </span>
                      )}
                      &nbsp;
                      {coffee_shop.state && coffee_shop.state_url ? (
                        <a
                          href={coffee_shop.state_url}
                          className="text-brown-600 hover:text-brown-900"
                        >
                          {coffee_shop.state}
                        </a>
                      ) : (
                        <span>{coffee_shop.state}</span>
                      )}
                      {userLocation && coffee_shop.lat && coffee_shop.lng && (
                        <span className="text-gray-500 ml-1">
                          ({getDistance()})
                        </span>
                      )}
                    </span>
                  ) : (
                    <span>&nbsp;</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
            <div className="flex space-x-2.5 items-center">
              {coffee_shop.links &&
                coffee_shop.links.length > 0 &&
                coffee_shop.links
                  .filter((link) => link.url)
                  .map((link, i) => (
                    <span key={i}>
                      <a
                        href={
                          link.url.startsWith("http")
                            ? link.url
                            : `https://${link.url}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900"
                      >
                        {getLinkIcon(link.name)}
                      </a>
                    </span>
                  ))}
            </div>

            <a
              href={`/${coffee_shop.slug}`}
              className="text-brown-600 text-sm hover:text-brown-900"
            >
              View &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoffeeShopCard
