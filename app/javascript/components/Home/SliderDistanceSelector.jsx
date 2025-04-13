import React, { useState, useEffect, useCallback, useRef } from "react";

// Same distance options as the original component
const distanceOptions = [
  { value: 5, label: "5km" },
  { value: 10, label: "10km" },
  { value: 20, label: "20km" },
  { value: 30, label: "30km" },
];

const SliderDistanceSelector = ({ selectedDistance, handleDistanceChange, disabled = false }) => {
  const [localDistance, setLocalDistance] = useState(selectedDistance);
  const isUserInteractingRef = useRef(false);
  const lastAppliedValueRef = useRef(selectedDistance);

  // Find the index of the current selected distance in our options
  const currentIndex = distanceOptions.findIndex(option => option.value === localDistance);

  // Update local distance when the prop changes, but only if we're not in the middle of a user interaction
  useEffect(() => {
    if (!isUserInteractingRef.current && selectedDistance !== lastAppliedValueRef.current) {
      setLocalDistance(selectedDistance);
      lastAppliedValueRef.current = selectedDistance;
    }
  }, [selectedDistance]);

  // Debounce the distance change handler
  const debouncedDistanceChange = useCallback(
    (() => {
      let timeout;
      return (value) => {
        // Skip if the value hasn't changed
        if (value === lastAppliedValueRef.current) return;

        clearTimeout(timeout);
        timeout = setTimeout(() => {
          lastAppliedValueRef.current = value;
          handleDistanceChange(value);
        }, 300); // Reduced to 300ms for better responsiveness
      };
    })(),
    [handleDistanceChange]
  );

  // Handle slider change
  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value, 10);
    const distanceValue = distanceOptions[value].value;
    setLocalDistance(distanceValue);

    // If we're in the middle of a user interaction, we want to immediately update the UI
    // but debounce the actual API call
    if (isUserInteractingRef.current) {
      debouncedDistanceChange(distanceValue);
    }
  };

  // Handle slider interactions
  const handleSliderStart = () => {
    isUserInteractingRef.current = true;
  };

  const handleSliderEnd = () => {
    // We need to make sure the final value is applied
    const finalValue = localDistance;

    // Small delay to ensure the final value is captured
    setTimeout(() => {
      isUserInteractingRef.current = false;

      // Only trigger API call if the value has actually changed
      if (finalValue !== lastAppliedValueRef.current) {
        lastAppliedValueRef.current = finalValue;
        handleDistanceChange(finalValue);
      }
    }, 50);
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500 font-medium">Distance</span>
        <span className="text-sm font-medium text-brown-600">{localDistance}km</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min="0"
          max={distanceOptions.length - 1}
          value={currentIndex}
          onChange={handleSliderChange}
          onMouseDown={handleSliderStart}
          onMouseUp={handleSliderEnd}
          onTouchStart={handleSliderStart}
          onTouchEnd={handleSliderEnd}
          disabled={disabled}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
            disabled ? "bg-gray-200" : "bg-gray-300"
          }`}
          style={{
            // Custom styling for the slider thumb
            WebkitAppearance: "none",
            appearance: "none",
            background: `linear-gradient(to right, #8B5E3C 0%, #8B5E3C ${(currentIndex / (distanceOptions.length - 1)) * 100}%, #e5e7eb ${(currentIndex / (distanceOptions.length - 1)) * 100}%, #e5e7eb 100%)`,
          }}
        />
      </div>
    </div>
  );
};

export default SliderDistanceSelector;
