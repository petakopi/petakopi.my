import React, { useState, useEffect, useRef } from "react"
import {
  FilterCategory,
  InfoPopover,
  RadioFilterOption,
  CheckboxFilterOption,
  FilterSearch,
  FilterActions,
  LocationFilter
} from "./FilterComponents"

const FilterSidebar = ({ isOpen, onClose, onApplyFilters, currentFilters = {} }) => {
  const [keyword, setKeyword] = useState(currentFilters.keyword || "")
  const [selectedTags, setSelectedTags] = useState(currentFilters.tags || [])
  const [selectedMuslimTag, setSelectedMuslimTag] = useState(currentFilters.muslimTag || null)
  const [selectedState, setSelectedState] = useState(currentFilters.state || null)
  const [selectedDistrict, setSelectedDistrict] = useState(currentFilters.district || null)
  const [isOpenNow, setIsOpenNow] = useState(currentFilters.opened === "true")
  const [isApplied, setIsApplied] = useState(false)
  const [muslimTagsOpen, setMuslimTagsOpen] = useState(true)
  const [otherTagsOpen, setOtherTagsOpen] = useState(true)
  const [locationOpen, setLocationOpen] = useState(true)
  const [openingHoursOpen, setOpeningHoursOpen] = useState(true)
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
    setSelectedState(currentFilters.state || null)
    setSelectedDistrict(currentFilters.district || null)
    setIsOpenNow(currentFilters.opened === "true")

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

    if (selectedState) {
      filters.state = selectedState
    }

    if (selectedDistrict) {
      filters.district = selectedDistrict
    }

    if (isOpenNow) {
      filters.opened = "true"
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
    setSelectedState(null)
    setSelectedDistrict(null)
    setIsOpenNow(false)
    onApplyFilters({})
    // Keep sidebar open to show the reset state
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
      className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-[-100%]'
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
          <FilterSearch
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search coffee shops..."
          />

          <FilterCategory
            title="Location"
            isOpen={locationOpen}
            setIsOpen={setLocationOpen}
            count={(selectedState ? 1 : 0) + (selectedDistrict ? 1 : 0)}
          >
            <LocationFilter
              selectedState={selectedState}
              selectedDistrict={selectedDistrict}
              onStateChange={setSelectedState}
              onDistrictChange={setSelectedDistrict}
            />
          </FilterCategory>

          <FilterCategory
            title="Opening Hours"
            isOpen={openingHoursOpen}
            setIsOpen={setOpeningHoursOpen}
            count={isOpenNow ? 1 : 0}
          >
            <CheckboxFilterOption
              id="open-now"
              name="open-now"
              checked={isOpenNow}
              onChange={() => setIsOpenNow(!isOpenNow)}
              label="Open Now"
            />
          </FilterCategory>

          <FilterCategory
            title="For Muslims"
            isOpen={muslimTagsOpen}
            setIsOpen={setMuslimTagsOpen}
            count={selectedMuslimTag ? 1 : 0}
            hasInfo={true}
            infoButtonRef={infoButtonRef}
            onInfoClick={() => setShowInfoPopover(!showInfoPopover)}
          >
            <RadioFilterOption
              id="muslim-tag-none"
              name="muslim-tag"
              checked={selectedMuslimTag === null}
              onChange={() => handleMuslimTagChange(null)}
              label="No preference"
            />

            {muslimTags.map((tag) => (
              <RadioFilterOption
                key={tag.value}
                id={`muslim-tag-${tag.value}`}
                name="muslim-tag"
                checked={selectedMuslimTag === tag.value}
                onChange={() => handleMuslimTagChange(tag.value)}
                label={tag.label}
              />
            ))}
          </FilterCategory>

          <FilterCategory
            title="Other Tags"
            isOpen={otherTagsOpen}
            setIsOpen={setOtherTagsOpen}
            count={selectedTags.length}
          >
            {otherTags.map((tag) => (
              <CheckboxFilterOption
                key={tag.value}
                id={`tag-${tag.value}`}
                name={`tag-${tag.value}`}
                checked={selectedTags.includes(tag.value)}
                onChange={() => handleTagToggle(tag.value)}
                label={tag.label}
              />
            ))}
          </FilterCategory>

          {isApplied && (
            <div className="p-4 bg-green-50 text-green-700 text-xs">
              Filters applied successfully!
            </div>
          )}

          <FilterActions
            onReset={handleReset}
            isSubmitting={false}
          />

          <InfoPopover
            isOpen={showInfoPopover}
            onClose={() => setShowInfoPopover(false)}
            title="For Muslims"
            content="Most of the coffee shops don't have this information yet as we depends on the community to help us out."
          />
        </form>
      </div>
    </div>
  )
}

export default FilterSidebar
