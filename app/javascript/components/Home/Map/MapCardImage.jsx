import React, { useState } from "react"

const MapCardImage = ({ imageUrl, altText, className, shop }) => {
  const [imageError, setImageError] = useState(false);
  
  // If cover photo is available and hasn't errored, show it
  if (imageUrl && !imageError) {
    return (
      <img
        src={imageUrl}
        alt={altText}
        className={className}
        onError={() => setImageError(true)}
      />
    );
  }
  
  // If cover photo is not available or errored, try to use the logo
  if (shop?.logo_url) {
    return (
      <img
        src={shop.logo_url}
        alt={`${shop?.name || 'Coffee shop'} logo`}
        className={className}
        onError={() => {
          // If logo also fails, we'll fall back to the default placeholder
          setImageError(true);
        }}
      />
    );
  }
  
  // If neither cover photo nor logo is available, show placeholder
  return (
    <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
      <div className="h-20 w-20 rounded-full flex items-center justify-center bg-gray-200">
        <svg className="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>
  );
};

export default MapCardImage;
