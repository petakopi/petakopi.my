import React, { useState, useEffect, useRef } from "react"

const FilterSidebar = ({ isOpen, onClose, onApplyFilters, currentFilters = {} }) => {
  const [keyword, setKeyword] = useState(currentFilters.keyword || "")
  const [selectedTags, setSelectedTags] = useState(currentFilters.tags || [])
  const [selectedMuslimTag, setSelectedMuslimTag] = useState(currentFilters.muslimTag || null)
  const [isApplied, setIsApplied] = useState(false)
  const [muslimTagsOpen, setMuslimTagsOpen] = useState(true)
  const [otherTagsOpen, setOtherTagsOpen] = useState(true)
  const [showInfoPopover, setShowInfoPopover] = useState(false)
  const infoButtonRef = useRef(null)

  // Available tags with their emoji and labels
  const muslimTags = [
    { value: "halal-certified", label: "Halal Certified" },
    { value: "muslim-owner", label: "Muslim Owner" },
    { value: "muslim-friendly", label: "Muslim Friendly" },
    { value: "non-halal", label: "Non Halal" }
  ]

  const otherTags = [
    { value: "work-friendly", label: "🧑‍💻 Work Friendly" },
    { value: "early-bird", label: "☀️ Early Bird" },
    { value: "night-owl", label: "🌖 Night Owl" },
    { value: "pour-over", label: "💧 Pour-over" },
    { value: "mobile", label: "🚗 Mobile" },
    { value: "stall", label: "⛱ Stall" },
    { value: "home", label: "🏡 Home" },
    { value: "tourism-malaysia", label: "🏝️ Tourism Malaysia" }
  ]

  // Initialize state from current filters
  useEffect(() => {
    setKeyword(currentFilters.keyword || "")

    // Extract Muslim tags from the current filters
    const tags = currentFilters.tags || [];
    const muslimTagValues = muslimTags.map(tag => tag.value);
    const foundMuslimTag = tags.find(tag => muslimTagValues.includes(tag));

    setSelectedMuslimTag(foundMuslimTag || null);

    // Set other tags (excluding Muslim tags)
    setSelectedTags(tags.filter(tag => !muslimTagValues.includes(tag)));

    setIsApplied(false);
  }, [currentFilters, isOpen]);

  // Handle toggling of regular tags (non-Muslim tags)
  const handleTagToggle = (tagValue) => {
    setSelectedTags(prevTags => {
      if (prevTags.includes(tagValue)) {
        return prevTags.filter(tag => tag !== tagValue)
      } else {
        return [...prevTags, tagValue]
      }
    })
  }

  // Handle selection of Muslim tag (radio button behavior)
  const handleMuslimTagChange = (tagValue) => {
    setSelectedMuslimTag(tagValue);
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Combine regular tags with the selected Muslim tag (if any)
    const allTags = [...selectedTags];
    if (selectedMuslimTag) {
      allTags.push(selectedMuslimTag);
    }

    console.log("Submitting filter form with keyword:", keyword, "and tags:", allTags);

    // Only include filters if they're not empty
    const filters = {}
    if (keyword && keyword.trim() !== '') {
      filters.keyword = keyword.trim()
    }

    if (allTags.length > 0) {
      filters.tags = allTags
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
    setSelectedMuslimTag(null)
    onApplyFilters({})
    // Keep sidebar open to show the reset state
  }

  // Helper function to render a category header with toggle and count indicator
  const renderCategoryHeader = (title, isOpen, setIsOpen, count = 0, hasInfo = false) => {
    return (
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
                    setShowInfoPopover(!showInfoPopover);
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
    )
  }

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (infoButtonRef.current && !infoButtonRef.current.contains(event.target)) {
        setShowInfoPopover(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [infoButtonRef]);

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

      <div className="overflow-y-auto h-full pb-20">
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b border-gray-200">
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

          <div className="p-4 border-b border-gray-200 relative">
            {renderCategoryHeader("For Muslim", muslimTagsOpen, setMuslimTagsOpen, selectedMuslimTag ? 1 : 0, true)}

            {showInfoPopover && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-25">
                <div
                  className="bg-white shadow-lg rounded-md border border-gray-200 p-4 m-4 max-w-xs w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-sm font-medium text-gray-900 mb-2">For Muslim</h3>
                  <div className="text-xs text-gray-600">
                    Most of the coffee shops don't have this information yet. We're working on collecting more data.
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      className="px-3 py-1 text-xs font-medium text-white bg-brown-500 border border-transparent rounded-md hover:bg-brown-600"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowInfoPopover(false);
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {muslimTagsOpen && (
              <div className="mt-2 space-y-2">
                {/* Clear option */}
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="muslim-tag-none"
                      name="muslim-tag"
                      type="radio"
                      checked={selectedMuslimTag === null}
                      onChange={() => handleMuslimTagChange(null)}
                      className="focus:ring-brown-500 h-4 w-4 text-brown-600 border-gray-300"
                    />
                  </div>
                  <div className="ml-2 text-sm">
                    <label htmlFor="muslim-tag-none" className="text-xs text-gray-700 cursor-pointer">
                      No preference
                    </label>
                  </div>
                </div>

                {/* Muslim tags */}
                {muslimTags.map((tag) => (
                  <div key={tag.value} className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id={`muslim-tag-${tag.value}`}
                        name="muslim-tag"
                        type="radio"
                        checked={selectedMuslimTag === tag.value}
                        onChange={() => handleMuslimTagChange(tag.value)}
                        className="focus:ring-brown-500 h-4 w-4 text-brown-600 border-gray-300"
                      />
                    </div>
                    <div className="ml-2 text-sm">
                      <label htmlFor={`muslim-tag-${tag.value}`} className="text-xs text-gray-700 cursor-pointer">
                        {tag.label}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Other Tags Category */}
          <div className="p-4 border-b border-gray-200">
            {renderCategoryHeader("Other Tags", otherTagsOpen, setOtherTagsOpen, selectedTags.length)}

            {otherTagsOpen && (
              <div className="mt-2 space-y-2">
                {otherTags.map((tag) => (
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
            )}
          </div>

          {isApplied && (
            <div className="p-4 bg-green-50 text-green-700 text-xs">
              Filters applied successfully!
            </div>
          )}

          <div className="p-4 flex justify-between">
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
