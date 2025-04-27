import React, { memo } from "react"
import MapCardImage from "./MapCardImage"
import MapCardInfo from "./MapCardInfo"

const MapCard = ({ shop, isSelected, isHighlighted, onClick }) => {
  // Create a background style with the logo as a blurred background
  const backgroundStyle = shop.logo_url ? {
    backgroundImage: `url(${shop.logo_url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'blur(8px)',
    opacity: '0.3',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0
  } : {};

  return (
    <div
      id={`shop-${shop.id}`}
      className={`flex-shrink-0 w-64 bg-white rounded-lg overflow-hidden transition-all cursor-pointer relative
        ${isSelected ? 'shadow-lg ring-2 ring-brown-500' : 'shadow-md hover:shadow-lg'}
        ${isHighlighted ? 'border-2 border-brown-500' : ''}
      `}
      onClick={onClick}
    >
      {/* Background blur with logo (always shown as a placeholder when available) */}
      {shop.logo_url && <div style={backgroundStyle}></div>}

      <div className="flex flex-col h-full relative z-10">
        <div className="w-full h-32 overflow-hidden">
          <MapCardImage
            imageUrl={shop.cover_photo_url}
            altText={`${shop.name} cover`}
            className="w-full h-full object-cover"
            shop={shop}
          />
        </div>

        <MapCardInfo shop={shop} />
      </div>
    </div>
  )
}

// Use memo to prevent unnecessary re-renders
export default memo(MapCard)
