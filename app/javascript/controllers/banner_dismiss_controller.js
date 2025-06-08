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
    // Set cookie to hide banner for 3 days
    this.setBannerDismissedCookie()
    this.hideBanner()
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
