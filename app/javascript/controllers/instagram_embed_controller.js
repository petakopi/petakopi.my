import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["container"]

  connect() {
    // Only load if the element is visible in viewport
    if (this.isElementInViewport()) {
      this.loadInstagramEmbed()
    } else {
      // Create an intersection observer to load when visible
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadInstagramEmbed()
            observer.unobserve(this.element)
          }
        })
      })

      observer.observe(this.element)
    }
  }

  loadInstagramEmbed() {
    // Load Instagram embed script
    const script = document.createElement("script")
    script.src = "https://www.instagram.com/embed.js"
    script.async = true
    document.body.appendChild(script)

    // Clean up any existing script
    script.onload = () => {
      if (window.instgrm) {
        window.instgrm.Embeds.process()
      }
    }
  }

  isElementInViewport() {
    const rect = this.element.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }
}
