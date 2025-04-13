import React, { useState, useEffect } from "react"

const FilterSidebar = ({ isOpen, onClose, onApplyFilters, currentFilters = {} }) => {
  const [keyword, setKeyword] = useState(currentFilters.keyword || "")
  const [selectedTags, setSelectedTags] = useState(currentFilters.tags || [])
  const [isApplied, setIsApplied] = useState(false)

  // Available tags with their emoji and labels
  const availableTags = [
    { value: "work-friendly", label: "🧑‍💻 Work Friendly" },
    { value: "early-bird", label: "☀️ Early Bird" },
    { value: "night-owl", label: "🌖 Night Owl" },
    { value: "pour-over", label: "💧 Pour-over" },
    { value: "mobile", label: "🚗 Mobile" },
    { value: "stall", label: "⛱ Stall" },
    { value: "home", label: "🏡 Home" },
    { value: "halal-certified", label: "Halal Certified" },
    { value: "muslim-owner", label: "Muslim Owner" },
    { value: "muslim-friendly", label: "Muslim Friendly" },
    { value: "non-halal", label: "Non Halal" },
    { value: "tourism-malaysia", label: "🏝️ Tourism Malaysia" }
  ]

  // Reset the applied state when filters change
  useEffect(() => {
    setKeyword(currentFilters.keyword || "")
    setSelectedTags(currentFilters.tags || [])
    setIsApplied(false)
  }, [currentFilters, isOpen])

  const handleTagToggle = (tagValue) => {
    setSelectedTags(prevTags => {
      if (prevTags.includes(tagValue)) {
        return prevTags.filter(tag => tag !== tagValue)
      } else {
        return [...prevTags, tagValue]
      }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Submitting filter form with keyword:", keyword, "and tags:", selectedTags)

    // Only include filters if they're not empty
    const filters = {}
    if (keyword && keyword.trim() !== '') {
      filters.keyword = keyword.trim()
    }

    if (selectedTags.length > 0) {
      filters.tags = selectedTags
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
    setSelectedTags([])
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
        <h2 className="text-sm font-medium">Filters</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4 overflow-y-auto max-h-[calc(100vh-60px)]">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="keyword" className="block text-xs font-medium text-gray-700 mb-1">
              Keyword Search
            </label>
            <input
              type="text"
              id="keyword"
              name="keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search coffee shops..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Search by name, description, or location
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Filter by Tags
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2">
              {availableTags.map((tag) => (
                <div key={tag.value} className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id={`tag-${tag.value}`}
                      name={`tag-${tag.value}`}
                      type="checkbox"
                      checked={selectedTags.includes(tag.value)}
                      onChange={() => handleTagToggle(tag.value)}
                      className="focus:ring-brown-500 h-4 w-4 text-brown-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-2 text-sm">
                    <label htmlFor={`tag-${tag.value}`} className="text-xs text-gray-700 cursor-pointer">
                      {tag.label}
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Select multiple tags to filter coffee shops
            </p>
          </div>

          {isApplied && (
            <div className="mt-4 p-2 bg-green-50 text-green-700 text-xs rounded-md">
              Filters applied successfully!
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-medium text-white bg-brown-500 border border-transparent rounded-md hover:bg-brown-600"
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
