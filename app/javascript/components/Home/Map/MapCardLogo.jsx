import React, { useState } from "react"

const MapCardLogo = ({ logoUrl, shopName }) => {
  const [logoError, setLogoError] = useState(false);

  if (!logoUrl || logoError) {
    return (
      <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gray-200">
        <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={`${shopName} logo`}
      className="h-10 w-10 rounded-full border border-brown"
      loading="lazy"
      onError={() => setLogoError(true)}
    />
  );
};

export default MapCardLogo;
