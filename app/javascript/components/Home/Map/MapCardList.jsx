import React, { useRef } from "react"
import MapCard from "./MapCard"

const MapCardList = ({
  visibleShops,
  selectedShopId,
  highlightedShopId,
  onCardClick,
  hasClusters = false
}) => {
  // visibleShops should already be limited to 20 in the parent component
  const limitedShops = visibleShops
  const hasMore = hasClusters // Show "zoom in" card if there are clusters
  
  console.log("MapCardList - hasClusters:", hasClusters);
  console.log("MapCardList - hasMore:", hasMore);

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

        {/* Always show the card if hasClusters is true */}
        {hasClusters && (
          <div key="more-info" className="flex-shrink-0 w-64 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-md overflow-hidden border-2 border-dashed border-brown-200">
            <div className="h-full p-4 flex flex-col items-center justify-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brown-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-brown-600 font-medium">
                More coffee shops available!
              </p>
              <p className="text-xs text-brown-500 mt-2">
                Zoom in further to see individual shops in the clustered areas.
              </p>
              <div className="mt-3 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brown-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-brown-500 italic">Click on clusters to zoom in</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MapCardList
