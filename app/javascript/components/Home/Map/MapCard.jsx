import React from "react"

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
        <div className="w-full">
          {shop.cover_photo_url ? (
            <div className="w-full h-32 overflow-hidden">
              <img
                src={shop.cover_photo_url}
                alt={`${shop.name} cover`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                }}
              />
            </div>
          ) : (
            <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
              <div className="h-20 w-20 rounded-full flex items-center justify-center bg-gray-200">
                <svg className="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 h-10 w-10">
              {shop.logo_url ? (
                <img
                  src={shop.logo_url}
                  alt={`${shop.name} logo`}
                  className="h-10 w-10 rounded-full border border-brown"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/40x40?text=Logo";
                  }}
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
              <h3 className="text-base font-medium text-gray-900">{shop.name}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapCard
