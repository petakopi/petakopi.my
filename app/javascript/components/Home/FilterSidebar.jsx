import React, { useState, useEffect } from "react"

const FilterSidebar = ({ isOpen, onClose, onApplyFilters, currentFilters = {} }) => {
  const [keyword, setKeyword] = useState(currentFilters.keyword || "")
  const [isApplied, setIsApplied] = useState(false)
  
  // Reset the applied state when filters change
  useEffect(() => {
    setKeyword(currentFilters.keyword || "")
    setIsApplied(false)
  }, [currentFilters, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Submitting filter form with keyword:", keyword)
    
    // Only include keyword if it's not empty
    const filters = {}
    if (keyword && keyword.trim() !== '') {
      filters.keyword = keyword.trim()
    }
    
    // Apply filters immediately with a completely new object
    // Use a timestamp to ensure the object is always different
    onApplyFilters({
      ...filters,
      _timestamp: Date.now()
    })
    
    // Show feedback
    setIsApplied(true)
    
    // Close sidebar after a short delay
    setTimeout(() => {
      onClose()
    }, 800)
  }

  const handleReset = () => {
    setKeyword("")
    onApplyFilters({})
    // Keep sidebar open to show the reset state
  }

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-[-100%]'
      }`}
    >
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium">Filters</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">
              Keyword Search
            </label>
            <input
              type="text"
              id="keyword"
              name="keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search coffee shops..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Search by name, description, or location
            </p>
          </div>

          {isApplied && (
            <div className="mt-4 p-2 bg-green-50 text-green-700 text-sm rounded-md">
              Filters applied successfully!
            </div>
          )}
          
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-brown-500 border border-transparent rounded-md hover:bg-brown-600"
            >
              Apply Filters
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FilterSidebar
