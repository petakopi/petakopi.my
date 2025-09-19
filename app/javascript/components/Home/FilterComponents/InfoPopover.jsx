import React from "react"

const InfoPopover = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-25">
      <div
        className="bg-white shadow-lg rounded-md border border-gray-200 p-4 m-4 max-w-xs w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-medium text-gray-900 mb-2">{title}</h3>
        <div className="text-xs text-gray-600">{content}</div>
        <div className="mt-4 flex justify-end">
          <button
            className="px-3 py-1 text-xs font-medium text-white bg-brown-500 border border-transparent rounded-md hover:bg-brown-600 transition-colors duration-150"
            onClick={(e) => {
              e.preventDefault()
              onClose()
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default InfoPopover
