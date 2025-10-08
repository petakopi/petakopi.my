/**
 * Analytics tracking utility for Google Analytics
 * Safely handles gtag calls even when GA is blocked or not loaded
 */

/**
 * Parse user agent to extract meaningful device information
 * @param {string} userAgent - The navigator.userAgent string
 * @returns {object} Parsed device information
 */
export function parseUserAgent(userAgent) {
  const ua = userAgent || ""

  // Detect device type
  let deviceType = "Unknown"
  if (/iPhone/.test(ua)) deviceType = "iPhone"
  else if (/iPad/.test(ua)) deviceType = "iPad"
  else if (/iPod/.test(ua)) deviceType = "iPod"
  else if (/Macintosh/.test(ua)) deviceType = "Mac"

  // Detect iOS version
  const iosMatch = ua.match(/OS (\d+)_(\d+)/)
  const iosVersion = iosMatch ? `${iosMatch[1]}.${iosMatch[2]}` : "Unknown"

  // Detect browser
  let browser = "Unknown"
  if (/Safari/.test(ua) && !/Chrome/.test(ua)) browser = "Safari"
  else if (/Chrome/.test(ua)) browser = "Chrome"
  else if (/Firefox/.test(ua)) browser = "Firefox"

  return {
    deviceType,
    iosVersion,
    browser,
    fullUserAgent: ua,
  }
}

/**
 * Track an event in Google Analytics
 * @param {string} eventName - The name of the event
 * @param {object} params - Additional parameters to send with the event
 */
export function trackEvent(eventName, params = {}) {
  // Check if gtag is available (production only, not blocked by ad blockers)
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    try {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera
      const deviceInfo = parseUserAgent(userAgent)

      window.gtag("event", eventName, {
        event_category: "app_banner",
        device_type: deviceInfo.deviceType,
        ios_version: deviceInfo.iosVersion,
        browser: deviceInfo.browser,
        user_agent: deviceInfo.fullUserAgent,
        ...params,
      })
    } catch (error) {
      // Silently fail if tracking fails
      console.debug("Analytics tracking failed:", error)
    }
  }
}

/**
 * Track app banner download click
 */
export function trackAppDownloadClick() {
  trackEvent("app_download_click", {
    event_label: "App Download Button Clicked",
  })
}

/**
 * Track app banner dismiss
 */
export function trackAppBannerDismiss() {
  trackEvent("app_banner_dismiss", {
    event_label: "App Banner Dismissed",
  })
}

/**
 * Track app banner impression (when banner is shown)
 */
export function trackAppBannerImpression() {
  trackEvent("app_banner_impression", {
    event_label: "App Banner Shown",
  })
}

/**
 * Track PWA install banner click
 */
export function trackPwaInstallClick() {
  trackEvent("pwa_install_click", {
    event_category: "pwa_banner",
    event_label: "PWA Install Button Clicked",
    platform: "android",
    source: "banner",
  })
}

/**
 * Track PWA banner dismiss
 */
export function trackPwaBannerDismiss() {
  trackEvent("pwa_banner_dismiss", {
    event_category: "pwa_banner",
    event_label: "PWA Banner Dismissed",
    platform: "android",
  })
}

/**
 * Track PWA banner impression (when banner is shown)
 */
export function trackPwaBannerImpression() {
  trackEvent("pwa_banner_impression", {
    event_category: "pwa_banner",
    event_label: "PWA Banner Shown",
    platform: "android",
  })
}
