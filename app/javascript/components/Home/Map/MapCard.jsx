import React, { memo } from "react"
import MapCardImage from "./MapCardImage"
import MapCardInfo from "./MapCardInfo"

const MapCard = ({ shop, isSelected, isHighlighted, onClick }) => {
  return (
    <div
      id={`shop-${shop.id}`}
      className={`flex-shrink-0 w-64 bg-white rounded-lg overflow-hidden transition-all cursor-pointer 
        ${isSelected && !isHighlighted ? 'shadow-lg ring-2 ring-brown-500' : 'shadow-md hover:shadow-lg'}
        ${isHighlighted ? 'card-highlight-animation' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        <div className="w-full h-32 overflow-hidden">
          <MapCardImage 
            imageUrl={shop.cover_photo_url} 
            altText={`${shop.name} cover`} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <MapCardInfo shop={shop} />
      </div>
    </div>
  )
}

// Use memo to prevent unnecessary re-renders
export default memo(MapCard)
