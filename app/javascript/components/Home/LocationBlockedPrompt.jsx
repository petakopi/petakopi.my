import React from "react"

const LocationBlockedPrompt = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 className="text-base font-semibold text-gray-900">
                Location Access Blocked
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Your browser has blocked location access. To use
                  location-based features like finding nearby coffee shops,
                  you'll need to enable location permissions.
                </p>
                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    How to enable location:
                  </h4>
                  <ul className="list-disc pl-5 text-sm text-gray-500 space-y-1">
                    <li>
                      Click the lock/info icon in your browser's address bar
                    </li>
                    <li>Find "Location" or "Site settings"</li>
                    <li>Change the permission to "Allow"</li>
                    <li>Refresh the page</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex w-full justify-center rounded-md bg-brown-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brown-500 sm:ml-3 sm:w-auto"
            >
              Refresh Page
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocationBlockedPrompt
