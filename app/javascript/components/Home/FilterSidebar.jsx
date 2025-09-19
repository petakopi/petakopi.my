import React, { useState, useEffect, useRef } from "react"
import {
  FilterCategory,
  InfoPopover,
  RadioFilterOption,
  CheckboxFilterOption,
  FilterSearch,
  FilterActions,
  LocationFilter,
  SelectFilterOption
} from "./FilterComponents"
import { useTags } from "../../hooks/useFilters"

const distanceOptions = [
  { value: 5, label: "5km" },
  { value: 10, label: "10km" },
  { value: 20, label: "20km" },
  { value: 30, label: "30km" }
]

const ratingOptions = [
  { value: "4.0", label: "4.0+" },
  { value: "4.2", label: "4.2+" },
  { value: "4.4", label: "4.4+" },
  { value: "4.6", label: "4.6+" },
  { value: "4.8", label: "4.8+" },
  { value: "5.0", label: "5.0" }
]

const ratingCountOptions = [
  { value: 50, label: "50+" },
  { value: 100, label: "100+" },
  { value: 200, label: "200+" },
  { value: 300, label: "300+" },
  { value: 500, label: "500+" },
  { value: 1000, label: "1,000+" }
]

const FilterSidebar = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters = {},
  locationPermission,
  activeTab,
  states,
  isLoadingStates,
  stateError,
  collections = []
}) => {
  const [keyword, setKeyword] = useState(currentFilters.keyword || "")
  const [selectedTags, setSelectedTags] = useState(currentFilters.tags || [])
  const [selectedMuslimTag, setSelectedMuslimTag] = useState(currentFilters.muslimTag || null)
  const [selectedState, setSelectedState] = useState(currentFilters.state || null)
  const [selectedDistrict, setSelectedDistrict] = useState(currentFilters.district || null)
  const [selectedCollection, setSelectedCollection] = useState(currentFilters.collection_id || null)
  const [isOpenNow, setIsOpenNow] = useState(currentFilters.opened === "true")
  const [selectedDistance, setSelectedDistance] = useState(currentFilters.distance || null)
  const [selectedRating, setSelectedRating] = useState(currentFilters.rating || null)
  const [selectedRatingCount, setSelectedRatingCount] = useState(currentFilters.rating_count || null)
  const [isApplied, setIsApplied] = useState(false)
  const [muslimTagsOpen, setMuslimTagsOpen] = useState(true)
  const [otherTagsOpen, setOtherTagsOpen] = useState(true)
  const [locationOpen, setLocationOpen] = useState(true)
  const [openingHoursOpen, setOpeningHoursOpen] = useState(true)
  const [distanceOpen, setDistanceOpen] = useState(true)
  const [ratingOpen, setRatingOpen] = useState(true)
  const [showInfoPopover, setShowInfoPopover] = useState(false)
  const infoButtonRef = useRef(null)

  // Available tags with their emoji and labels
  const muslimTags = [
    { value: "halal-certified", label: "Halal Certified" },
    { value: "muslim-owner", label: "Muslim Owner" },
    { value: "muslim-friendly", label: "Muslim Friendly" },
    { value: "non-halal", label: "Non Halal" }
  ]

  // Use React Query for dynamic tag loading with 6-hour cache
  const {
    data: otherTags = [],
    isLoading: isLoadingTags,
    error: tagsError,
  } = useTags()

  // Configuration for filter visibility and behavior
  const FILTER_CONFIG = {
    search: {
      title: "Search",
      component: FilterCategory,
      showInMapView: false,
      props: (state, handlers) => ({
        title: "Search",
        isOpen: true,
        setIsOpen: () => { },
        count: state.keyword.trim() !== '' ? 1 : 0,
        children: (
          <FilterSearch
            value={state.keyword}
            onChange={(e) => handlers.setKeyword(e.target.value)}
            placeholder="Search coffee shops..."
          />
        )
      })
    },
    distance: {
      title: "Distance",
      component: FilterCategory,
      showInMapView: false,
      props: (state, handlers) => ({
        title: "Distance",
        isOpen: state.distanceOpen,
        setIsOpen: handlers.setDistanceOpen,
        count: state.selectedDistance !== null ? 1 : 0,
        children: (
          <>
            {state.locationPermission !== "granted" && (
              <div className="mb-3 p-2 bg-yellow-50 text-yellow-800 text-xs rounded">
                Enable location to use distance filter
              </div>
            )}
            <RadioFilterOption
              id="distance-none"
              name="distance"
              checked={state.selectedDistance === null}
              onChange={() => handlers.setSelectedDistance(null)}
              label="No preference"
              disabled={state.locationPermission !== "granted"}
            />
            {distanceOptions.map((option) => (
              <RadioFilterOption
                key={option.value}
                id={`distance-${option.value}`}
                name="distance"
                checked={state.selectedDistance === option.value}
                onChange={() => handlers.setSelectedDistance(option.value)}
                label={option.label}
                disabled={state.locationPermission !== "granted"}
              />
            ))}
          </>
        )
      })
    },
    location: {
      title: "Location",
      component: FilterCategory,
      showInMapView: false,
      props: (state, handlers) => ({
        title: "Location",
        isOpen: state.locationOpen,
        setIsOpen: handlers.setLocationOpen,
        count: (state.selectedState ? 1 : 0) + (state.selectedDistrict ? 1 : 0),
        children: (
          <LocationFilter
            selectedState={state.selectedState}
            selectedDistrict={state.selectedDistrict}
            onStateChange={handlers.setSelectedState}
            onDistrictChange={handlers.setSelectedDistrict}
            states={states}
            isLoadingStates={isLoadingStates}
            stateError={stateError}
          />
        )
      })
    },
    collections: {
      title: "Collections",
      component: FilterCategory,
      showInMapView: true,
      props: (state, handlers) => ({
        title: "Collections",
        isOpen: true,
        setIsOpen: () => { },
        count: state.selectedCollection ? 1 : 0,
        badgeLabel: state.selectedCollection
          ? state.collections.find(c => c.id === state.selectedCollection)?.name
          : null,
        children: (
          <>
            <RadioFilterOption
              id="collection-none"
              name="collection"
              checked={state.selectedCollection === null}
              onChange={() => handlers.setSelectedCollection(null)}
              label="No preference"
            />
            {state.collections.map((collection) => (
              <RadioFilterOption
                key={collection.id}
                id={`collection-${collection.id}`}
                name="collection"
                checked={state.selectedCollection === collection.id}
                onChange={() => handlers.setSelectedCollection(collection.id)}
                label={
                  <span className="truncate block" title={collection.name}>
                    {collection.name}
                  </span>
                }
              />
            ))}
          </>
        )
      })
    },
    openingHours: {
      title: "Opening Hours",
      component: FilterCategory,
      showInMapView: true,
      props: (state, handlers) => ({
        title: "Opening Hours",
        isOpen: state.openingHoursOpen,
        setIsOpen: handlers.setOpeningHoursOpen,
        count: state.isOpenNow ? 1 : 0,
        children: (
          <CheckboxFilterOption
            id="open-now"
            name="open-now"
            checked={state.isOpenNow}
            onChange={() => handlers.setIsOpenNow(!state.isOpenNow)}
            label="Open Now"
          />
        )
      })
    },
    rating: {
      title: "Rating",
      component: FilterCategory,
      showInMapView: true,
      props: (state, handlers) => ({
        title: "Rating",
        isOpen: state.ratingOpen,
        setIsOpen: handlers.setRatingOpen,
        count: (state.selectedRating !== null ? 1 : 0) + (state.selectedRatingCount !== null ? 1 : 0),
        children: (
          <>
            <SelectFilterOption
              id="rating-select"
              name="rating"
              value={state.selectedRating || ""}
              onChange={(e) => handlers.setSelectedRating(e.target.value || null)}
              options={[
                { value: "", label: "No preference" },
                ...ratingOptions
              ]}
              label="Minimum rating"
            />
            <SelectFilterOption
              id="rating-count-select"
              name="rating_count"
              value={state.selectedRatingCount || ""}
              onChange={(e) => handlers.setSelectedRatingCount(e.target.value || null)}
              options={[
                { value: "", label: "No preference" },
                ...ratingCountOptions
              ]}
              label="Minimum rating count"
            />
          </>
        )
      })
    },
    muslimTags: {
      title: "For Muslims",
      component: FilterCategory,
      showInMapView: true,
      props: (state, handlers) => ({
        title: "For Muslims",
        isOpen: state.muslimTagsOpen,
        setIsOpen: handlers.setMuslimTagsOpen,
        count: state.selectedMuslimTag ? 1 : 0,
        hasInfo: true,
        infoButtonRef: state.infoButtonRef,
        onInfoClick: () => handlers.setShowInfoPopover(!state.showInfoPopover),
        children: (
          <>
            <RadioFilterOption
              id="muslim-tag-none"
              name="muslim-tag"
              checked={state.selectedMuslimTag === null}
              onChange={() => handlers.handleMuslimTagChange(null)}
              label="No preference"
            />
            {state.muslimTags.map((tag) => (
              <RadioFilterOption
                key={tag.value}
                id={`muslim-tag-${tag.value}`}
                name="muslim-tag"
                checked={state.selectedMuslimTag === tag.value}
                onChange={() => handlers.handleMuslimTagChange(tag.value)}
                label={tag.label}
              />
            ))}
          </>
        )
      })
    },
    otherTags: {
      title: "Other Tags",
      component: FilterCategory,
      showInMapView: true,
      props: (state, handlers) => ({
        title: "Other Tags",
        isOpen: state.otherTagsOpen,
        setIsOpen: handlers.setOtherTagsOpen,
        count: state.selectedTags.length,
        children: (
          <>
            {isLoadingTags ? (
              <div className="p-2 text-center text-gray-500 text-xs">Loading tags...</div>
            ) : tagsError ? (
              <div className="p-2 text-center text-red-500 text-xs">Failed to load tags</div>
            ) : state.otherTags.length === 0 ? (
              <div className="p-2 text-center text-gray-500 text-xs">No tags available</div>
            ) : (
              state.otherTags.map((tag) => (
                <CheckboxFilterOption
                  key={tag.value}
                  id={`tag-${tag.value}`}
                  name={`tag-${tag.value}`}
                  checked={state.selectedTags.includes(tag.value)}
                  onChange={() => handlers.handleTagToggle(tag.value)}
                  label={tag.label}
                />
              ))
            )}
          </>
        )
      })
    }
  }

  // Initialize state from current filters
  useEffect(() => {
    setKeyword(currentFilters.keyword || "")
    setSelectedState(currentFilters.state || null)
    setSelectedDistrict(currentFilters.district || null)
    setSelectedCollection(currentFilters.collection_id || null)
    setIsOpenNow(currentFilters.opened === "true")
    setSelectedDistance(currentFilters.distance || null)
    setSelectedRating(currentFilters.rating || null)
    setSelectedRatingCount(currentFilters.rating_count || null)

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

    if (selectedCollection !== null) {
      filters.collection_id = selectedCollection
    }

    if (isOpenNow) {
      filters.opened = "true"
    }

    if (selectedDistance !== null) {
      filters.distance = selectedDistance
    }

    if (selectedRating !== null) {
      filters.rating = selectedRating
    }

    if (selectedRatingCount !== null && selectedRatingCount !== "") {
      filters.rating_count = parseInt(selectedRatingCount)
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
    setSelectedCollection(null)
    setIsOpenNow(false)
    setSelectedDistance(null)
    setSelectedRating(null)
    setSelectedRatingCount(null)
    setIsApplied(false)
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

  // Prepare state and handlers for filter components
  const state = {
    keyword,
    selectedTags,
    selectedMuslimTag,
    selectedState,
    selectedDistrict,
    selectedCollection,
    isOpenNow,
    selectedDistance,
    selectedRating,
    selectedRatingCount,
    muslimTagsOpen,
    otherTagsOpen,
    locationOpen,
    openingHoursOpen,
    distanceOpen,
    ratingOpen,
    showInfoPopover,
    infoButtonRef,
    locationPermission,
    muslimTags,
    otherTags,
    collections
  }

  const handlers = {
    setKeyword,
    setSelectedTags,
    setSelectedMuslimTag,
    setSelectedState,
    setSelectedDistrict,
    setSelectedCollection,
    setIsOpenNow,
    setSelectedDistance,
    setSelectedRating,
    setSelectedRatingCount,
    setMuslimTagsOpen,
    setOtherTagsOpen,
    setLocationOpen,
    setOpeningHoursOpen,
    setDistanceOpen,
    setRatingOpen,
    setShowInfoPopover,
    handleTagToggle,
    handleMuslimTagChange
  }

  // Get badge color based on active tab
  const getBadgeColor = () => {
    return activeTab === 0
      ? "bg-brown-100 text-brown-800" // List view - brown
      : "bg-blue-100 text-blue-800"   // Map view - blue
  }

  // Get button color based on active tab
  const getButtonColor = () => {
    return activeTab === 0
      ? "bg-brown-500 hover:bg-brown-600" // List view - brown
      : "bg-blue-500 hover:bg-blue-600"   // Map view - blue
  }

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

      <div className="overflow-y-auto h-full pb-32">
        <form onSubmit={handleSubmit}>
          {Object.entries(FILTER_CONFIG).map(([key, config]) => {
            // Skip filters that shouldn't be shown in the current view
            if (activeTab === 1 && !config.showInMapView) return null;

            const Component = config.component;
            const props = config.props(state, handlers);

            return (
              <Component
                key={key}
                {...props}
                badgeColor={activeTab === 0 ? "bg-brown-100 text-brown-800" : "bg-blue-100 text-blue-800"}
              />
            );
          })}

          {isApplied && (
            <div className="p-4 bg-green-50 text-green-700 text-xs">
              Filters applied successfully!
            </div>
          )}

          <FilterActions
            onReset={handleReset}
            isSubmitting={false}
            badgeColor={getButtonColor()}
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
