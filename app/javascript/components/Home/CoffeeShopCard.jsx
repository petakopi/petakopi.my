import React from "react"
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  TikTokIcon,
  WhatsAppIcon,
  GoogleIcon
} from "../Icons"

const CoffeeShopCard = ({ coffee_shop }) => {
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

  return (
    <div
      key={`${coffee_shop.slug}`}
      id={`coffee-shop-${coffee_shop.slug}`}
      className="mb-4 p-3 border border-gray-200 rounded-lg"
    >
      <div className="flex flex-col h-full">
        <div className="mb-3">
          {coffee_shop.cover_photo ? (
            <div className="w-full h-48 rounded-lg overflow-hidden">
              <img
                src={coffee_shop.cover_photo}
                alt={`${coffee_shop.name} cover`}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-48 bg-brown-100 rounded-lg flex items-center justify-center">
              <span className="text-brown-700 text-xl font-medium">{coffee_shop.name}</span>
            </div>
          )}
        </div>

        <div className="flex-grow">
          <div className="flex items-center gap-3 mb-1">
            {coffee_shop.logo && coffee_shop.logo !== "" && (
              <img
                src={coffee_shop.logo}
                alt={`${coffee_shop.name} logo`}
                className="w-[38px] h-[38px] rounded-full object-cover"
              />
            )}
            <h3 className="font-medium text-lg">{coffee_shop.name}</h3>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {coffee_shop.district && <span className="mr-1">{coffee_shop.district},</span>}
            {coffee_shop.state || 'Location not specified'}
          </p>

          {coffee_shop.links && coffee_shop.links.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-2">
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

        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            <span>Updated: {new Date(coffee_shop.updated_at).toLocaleDateString()}</span>
          </div>
          <a
            href={`/coffee_shops/${coffee_shop.slug}`}
            className="text-xs bg-brown-500 text-white px-3 py-1.5 rounded hover:bg-brown-600"
          >
            View Details
          </a>
        </div>
      </div>
    </div>
  )
}

export default CoffeeShopCard
