import React from "react"

const distanceOptions = [
  { value: 5, label: "5km" },
  { value: 10, label: "10km" },
  { value: 20, label: "20km" },
  { value: 30, label: "30km" },
]

const DistanceSelector = ({ selectedDistance, handleDistanceChange, disabled = false }) => {
  return (
    <div className="col-span-full mb-4">
      <div className="flex flex-wrap gap-2 justify-center">
        {distanceOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => !disabled && handleDistanceChange(option.value)}
            disabled={disabled}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedDistance === option.value
                ? "bg-brown-500 text-white"
                : disabled 
                  ? "bg-gray-200 text-gray-700"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
