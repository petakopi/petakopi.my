import React, { useState } from "react"

const MapCardImage = ({ imageUrl, altText, className }) => {
  const [imageError, setImageError] = useState(false);

  if (!imageUrl || imageError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="h-20 w-20 rounded-full flex items-center justify-center bg-gray-200">
          <svg className="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={altText}
      className={className}
      onError={() => setImageError(true)}
    />
  );
};

export default MapCardImage;
