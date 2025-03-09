import React from "react"

const LoadingIndicator = () => {
  return (
    <div className="col-span-full flex justify-center py-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brown-500"></div>
    </div>
  )
}

export default LoadingIndicator
