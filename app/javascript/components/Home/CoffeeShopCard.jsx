import React from "react"

const CoffeeShopCard = ({ coffee_shop, isLastElement, refCallback }) => {
  const cardRef = isLastElement ? refCallback : null;

  return (
    <div
      ref={cardRef}
      key={`${coffee_shop.slug}`}
      id={`coffee-shop-${coffee_shop.slug}`}
      className="mb-4 p-3 border border-gray-200 rounded-lg"
    >
      <div className="flex flex-col h-full">
        <div className="relative mb-3">
          <img
            src={coffee_shop.logo && coffee_shop.logo !== ""
              ? coffee_shop.logo
              : `https://placehold.co/600x400/brown/white?text=${encodeURIComponent(coffee_shop.name)}`}
            alt={coffee_shop.name}
            className="w-full h-48 object-cover rounded-lg"
          />
          {coffee_shop.district && (
            <span className="absolute top-2 right-2 bg-white bg-opacity-90 text-xs px-2 py-1 rounded-full">
              {coffee_shop.district}
            </span>
          )}
        </div>

        <div className="flex-grow">
          <h3 className="font-medium text-lg">{coffee_shop.name}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {coffee_shop.state || 'Location not specified'}
          </p>

          {coffee_shop.links && coffee_shop.links.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-2">
                {coffee_shop.links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                  >
                    {link.name}
                  </a>
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
