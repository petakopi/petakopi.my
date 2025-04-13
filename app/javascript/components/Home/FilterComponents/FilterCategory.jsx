import React from "react"

const FilterCategory = ({ title, isOpen, setIsOpen, count = 0, hasInfo = false, infoButtonRef, onInfoClick, children }) => {
  return (
    <div className="p-4 border-b border-gray-200 relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-2 text-left"
      >
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-900 flex items-center">
            {title}
            {hasInfo && (
              <span className="inline-flex items-center ml-1">
                <button
                  ref={infoButtonRef}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onInfoClick();
                  }}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none inline-flex items-center"
                  aria-label="Information"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </span>
            )}
          </span>

          {count > 0 && (
            <span className="ml-2 bg-brown-100 text-brown-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="mt-2 space-y-2">
          {children}
        </div>
      )}
    </div>
  )
}

export default FilterCategory
