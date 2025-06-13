import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    // Use IntersectionObserver to detect when the widget is visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this._initializeWidget()
          observer.unobserve(this.element)
        }
      })
    }, {
      threshold: 0.1 // Trigger when at least 10% of the element is visible
    })

    observer.observe(this.element)
  }

  _initializeWidget() {
    if (document.querySelector(".cf-turnstile") && window.turnstile) {
      // Reset any existing widget
      const container = document.querySelector(".cf-turnstile")
      if (container.dataset.widgetId) {
        window.turnstile.reset(container.dataset.widgetId)
      }

      // Render new widget
      window.turnstile.render(".cf-turnstile", {
        sitekey: document.querySelector(".cf-turnstile").dataset.sitekey,
        callback: (token) => {
          console.log("Turnstile callback received token:", token) // Debug log
          // Store token in a hidden input if it doesn't exist
          let input = document.querySelector("input[name='cf-turnstile-response']")
          if (!input) {
            input = document.createElement("input")
            input.type = "hidden"
            input.name = "cf-turnstile-response"
            this.element.appendChild(input)
          }
          input.value = token
        }
      })
    } else {
      console.log("Turnstile not ready, retrying...") // Debug log
      // If widget is not ready, try again in 100ms
      setTimeout(() => this._initializeWidget(), 100)
    }
  }
}
