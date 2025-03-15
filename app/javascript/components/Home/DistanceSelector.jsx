import React from "react"

const distanceOptions = [
  { value: 5, label: "5km" },
  { value: 10, label: "10km" },
  { value: 20, label: "20km" },
  { value: 30, label: "30km" },
]

const DistanceSelector = ({ selectedDistance, handleDistanceChange, disabled = false }) => {
  return (
    <div className="flex items-center">
      <div className="flex border border-gray-300 rounded-md overflow-hidden">
        {distanceOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => !disabled && handleDistanceChange(option.value)}
            disabled={disabled}
            className={`px-3 py-1.5 text-sm ${
              selectedDistance === option.value
                ? "bg-brown-500 text-white"
                : disabled 
                  ? "bg-white text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default DistanceSelector
