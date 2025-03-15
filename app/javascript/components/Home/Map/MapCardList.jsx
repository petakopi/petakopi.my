import React, { useRef } from "react"
import MapCard from "./MapCard"

const MapCardList = ({ 
  visibleShops, 
  selectedShopId, 
  highlightedShopId, 
  onCardClick 
}) => {
  // Limit to 20 shops for performance
  const limitedShops = visibleShops.slice(0, 20)
  const hasMore = visibleShops.length > 20
  
  // Reference for the scrollable container
  const containerRef = useRef(null)
  
  // Set up drag scrolling
  const setupDragScroll = (el) => {
    if (!el) return
    
    containerRef.current = el
    
    let isDown = false
    let startX
    let scrollLeft
    
    el.addEventListener('mousedown', (e) => {
      isDown = true
      el.style.cursor = 'grabbing'
      startX = e.pageX - el.offsetLeft
      scrollLeft = el.scrollLeft
      e.preventDefault()
    })
    
    el.addEventListener('mouseleave', () => {
      isDown = false
      el.style.cursor = 'grab'
    })
    
    el.addEventListener('mouseup', () => {
      isDown = false
      el.style.cursor = 'grab'
    })
    
    el.addEventListener('mousemove', (e) => {
      if (!isDown) return
      e.preventDefault()
      const x = e.pageX - el.offsetLeft
      const walk = (x - startX) * 2 // Scroll speed
      el.scrollLeft = scrollLeft - walk
    })
  }
  
  return (
    <div id="map-cards-container" className="absolute bottom-4 left-4 right-4 z-10 overflow-x-auto pb-2 max-h-[250px]">
      <div
        className="flex space-x-4 px-2 py-2 rounded-lg"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#6B4F4F #f5f5f5',
          cursor: 'grab'
        }}
        ref={setupDragScroll}
      >
        {limitedShops.map((shop, index) => (
          <MapCard
            key={`shop-${shop.id || index}`}
            shop={shop}
            isSelected={selectedShopId === shop.id}
            isHighlighted={highlightedShopId === shop.id}
            onClick={() => onCardClick(shop)}
          />
        ))}
        
        {hasMore && (
          <div key="more-info" className="flex-shrink-0 w-64 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-md overflow-hidden border-2 border-dashed border-brown-200">
            <div className="h-full p-4 flex flex-col items-center justify-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brown-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-brown-600">
                Cards limited to 20 coffee shops.
                <span className="block mt-1">Please zoom in further to see all shops in this area.</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MapCardList
