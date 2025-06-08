import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["banner"]

  connect() {
    // Check if banner should be hidden based on cookie
    if (this.isBannerDismissed()) {
      this.hideBanner()
    }
  }

  dismiss() {
    // Track dismiss event
    this.trackDismiss()

    // Set cookie to hide banner for 3 days
    this.setBannerDismissedCookie()
    this.hideBanner()
  }

  trackClick() {
    // Only track the click, don't dismiss the banner
    const utmUrl = 'https://www.pestakopi.com/?utm_source=petakopi&utm_medium=banner&utm_campaign=pesta_kopi_2025&utm_content=header_banner'

    // Track banner link click with Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'click', {
        event_category: 'Banner',
        event_label: 'Pesta Kopi 2025 Get More Info',
        custom_parameters: {
          utm_source: 'petakopi',
          utm_medium: 'banner',
          utm_campaign: 'pesta_kopi_2025',
          utm_content: 'header_banner',
          click_text: 'Get more info'
        },
        value: 1
      })
    }

    // Track with Plausible Analytics
    if (typeof plausible !== 'undefined') {
      plausible('Banner Click', {
        props: {
          campaign: 'Pesta Kopi 2025',
          url: utmUrl,
          source: 'header_banner',
          medium: 'banner',
          click_text: 'Get more info',
          utm_source: 'petakopi',
          utm_campaign: 'pesta_kopi_2025'
        }
      })
    }
  }

  trackDismiss() {
    // Track banner dismiss with Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'banner_dismiss', {
        event_category: 'Banner',
        event_label: 'Pesta Kopi 2025 Banner Dismissed',
        value: 1
      })
    }

    // Track with Plausible Analytics
    if (typeof plausible !== 'undefined') {
      plausible('Banner Dismiss', {
        props: {
          campaign: 'Pesta Kopi 2025',
          source: 'header_banner'
        }
      })
    }
  }

  hideBanner() {
    this.bannerTarget.style.display = "none"
  }

  isBannerDismissed() {
    return this.getCookie("banner_dismissed") === "true"
  }

  setBannerDismissedCookie() {
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 3) // 3 days from now

    document.cookie = `banner_dismissed=true; expires=${expiryDate.toUTCString()}; path=/`
  }

  getCookie(name) {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(';').shift()
    return null
  }
}
