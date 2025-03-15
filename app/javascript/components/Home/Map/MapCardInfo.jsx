import React from "react"
import MapCardLogo from "./MapCardLogo"

const MapCardInfo = ({ shop }) => {
  return (
    <div className="p-4">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0 h-10 w-10">
          <MapCardLogo logoUrl={shop.logo_url} shopName={shop.name} />
        </div>
        <div>
          <h3 className="text-base font-medium text-gray-900">{shop.name}</h3>
          {shop.distance_in_km && (
            <p className="text-xs text-brown-600 mt-1">
              {shop.distance_in_km} km away
            </p>
          )}
        </div>
      </div>
      
      {shop.address && (
        <p className="text-xs text-gray-600 mt-2 line-clamp-2">
          {shop.address}
        </p>
      )}
    </div>
  );
};

export default MapCardInfo;
