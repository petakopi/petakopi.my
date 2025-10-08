import React, { useState, useEffect } from "react"

export default function AppBanner() {
  const [isVisible, setIsVisible] = useState(false)

  // Check if user is on an Apple device
  const isAppleDevice = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera
    return /iPad|iPhone|iPod|Macintosh/.test(userAgent) && !window.MSStream
  }

  // Check if user has dismissed the banner before
  useEffect(() => {
    // Only show banner for Apple devices
    if (!isAppleDevice()) {
      setIsVisible(false)
      return
    }

    const dismissedAt = localStorage.getItem("petakopi_app_banner_dismissed_at")
    if (dismissedAt) {
      const dismissedDate = new Date(dismissedAt)
      const now = new Date()
      const daysSinceDismissed = Math.floor(
        (now - dismissedDate) / (1000 * 60 * 60 * 24)
      )

      // Show banner again after 7 days
      if (daysSinceDismissed < 7) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
    } else {
      // First time visitor on Apple device
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem(
      "petakopi_app_banner_dismissed_at",
      new Date().toISOString()
    )
  }

  if (!isVisible) return null

  return (
    <div className="mt-4 mb-6">
      <div className="bg-gradient-to-r from-white via-brown-50/30 to-white border border-brown-100 rounded-lg max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Tada Emoji */}
            <div className="flex-shrink-0">
              <span className="text-3xl" role="img" aria-label="celebration">
                🎉
              </span>
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-brown-800 sm:text-base">
                Try our new mobile app!
              </p>
              <p className="text-xs sm:text-sm text-brown-500 mt-0.5">
                Discover coffee shops on the go with CremaApp for iPhone
              </p>
            </div>

            {/* Download Button */}
            <div className="flex-shrink-0">
              <a
                href="/download"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brown-600 hover:bg-brown-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-500 transition-colors"
              >
                Download
              </a>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex-shrink-0">
            <button
              onClick={handleDismiss}
              className="inline-flex text-brown-300 hover:text-brown-500 focus:outline-none focus:ring-2 focus:ring-brown-500 rounded-md p-1"
              aria-label="Dismiss banner"
            >
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
