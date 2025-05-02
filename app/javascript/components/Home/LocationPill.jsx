import React from "react"

const LocationPill = ({ locationPermission, onRequestLocation }) => {
  const isLoading = locationPermission === "prompt"

  const getPillStyle = () => {
    switch (locationPermission) {
      case "granted":
        return "bg-green-100 text-green-700"
      case "blocked":
        return "bg-red-100 text-red-700 animate-pulse"
      case "denied":
      case "timeout":
        return "bg-red-100 text-red-700"
      case "prompt":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-yellow-100 text-yellow-700"
    }
  }

  const getLocationText = () => {
    switch (locationPermission) {
      case "granted":
        return "Location Enabled"
      case "denied":
        return "Location Disabled"
      case "blocked":
        return "Location Blocked"
      case "timeout":
        return "Location Timeout"
      case "prompt":
        return "Getting Location..."
      default:
        return "Enable Location"
    }
  }

  return (
    <button
      type="button"
      onClick={onRequestLocation}
      disabled={isLoading}
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getPillStyle()} ${
        isLoading ? 'cursor-wait opacity-75' : 'hover:opacity-80'
      }`}
    >
      {getLocationText()}
    </button>
  )
}

export default LocationPill
