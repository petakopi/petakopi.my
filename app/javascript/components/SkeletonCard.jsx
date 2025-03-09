import React from "react"

export default function SkeletonCard() {
  return (
    <div className="mb-4 p-3 border border-gray-200 rounded-lg animate-pulse">
      <div className="flex flex-col h-full">
        <div className="relative mb-3">
          <div className="w-full h-48 bg-gray-200 rounded-lg"></div>
          <div className="absolute top-2 right-2 bg-gray-300 h-5 w-20 rounded-full"></div>
        </div>

        <div className="flex-grow">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>

          <div className="mt-3">
            <div className="flex flex-wrap gap-2">
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
              <div className="h-6 bg-gray-200 rounded w-14"></div>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
    </div>
  )
}
