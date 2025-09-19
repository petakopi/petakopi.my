import { Controller } from "@hotwired/stimulus"
import ahoy from "ahoy.js"

export default class extends Controller {
  static targets = ["button"]

  connect() {
    if (this._isIOS() || this._isSafari()) {
      this.buttonTarget.classList.add("hidden")
    }
  }

  install() {
    // Show the Prompt
    window.deferredPrompt.prompt()
    // Wait for the user to respond to the prompt
    window.deferredPrompt.userChoice.then((choiceResult) => {
      ahoy.track("PWA", { accepted: choiceResult.outcome === "accepted" })

      window.deferredPrompt = null
    })
  }

  _isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
  }

  _isSafari() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  }
}
