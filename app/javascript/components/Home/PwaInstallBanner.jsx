import React, { useState, useEffect } from "react"
import {
  trackPwaInstallClick,
  trackPwaBannerDismiss,
  trackPwaBannerImpression,
} from "../../utils/analytics"

export default function PwaInstallBanner() {
  const [isVisible, setIsVisible] = useState(false)

  // Check if user is on Android mobile device
  const isAndroidMobile = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera
    return /android/i.test(userAgent) && /mobile/i.test(userAgent)
  }

  // Check if platform override is set via URL parameter
  const isPlatformOverride = () => {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get("platform") === "android"
  }

  // Check if beforeinstallprompt event has been captured
  useEffect(() => {
    // Show banner if Android mobile OR platform override is set
    if (!isAndroidMobile() && !isPlatformOverride()) {
      setIsVisible(false)
      return
    }

    const dismissedAt = localStorage.getItem("petakopi_pwa_banner_dismissed_at")
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
      // First time visitor on Android mobile
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    trackPwaBannerDismiss()
    setIsVisible(false)
    localStorage.setItem(
      "petakopi_pwa_banner_dismissed_at",
      new Date().toISOString()
    )
  }

  const handleInstallClick = () => {
    if (!window.deferredPrompt) {
      console.log("No deferred prompt available")
      return
    }

    trackPwaInstallClick()

    // Trigger the install prompt
    window.deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    window.deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the PWA install")
        // Hide banner after successful install
        setIsVisible(false)
      }

      // Clear the deferred prompt
      window.deferredPrompt = null
    })
  }

  // Track banner impression when it becomes visible
  useEffect(() => {
    if (isVisible) {
      trackPwaBannerImpression()
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="mt-4 mb-6">
      <div className="bg-gradient-to-r from-white via-brown-50/30 to-white border border-brown-100 rounded-lg max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* App Icon */}
            <div className="flex-shrink-0">
              <span className="text-3xl" role="img" aria-label="coffee">
                ☕
              </span>
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-brown-800 sm:text-base">
                Install CremaApp
              </p>
              <p className="text-xs sm:text-sm text-brown-500 mt-0.5">
                Add to your home screen for quick access
              </p>
            </div>

            {/* Install Button */}
            <div className="flex-shrink-0">
              <button
                onClick={handleInstallClick}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brown-600 hover:bg-brown-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-500 transition-colors"
              >
                Install
              </button>
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
