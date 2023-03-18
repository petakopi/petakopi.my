import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "lat",
    "lng",
    "loadingIcon",
    "loadingText",
  ]

  submit(_e) {
    this.loadingIconTarget.classList.remove("hidden")
    this.loadingIconTarget.classList.add("animate-spin")
    this.loadingTextTarget.innerText = "Checking..."
    this.element.disable = true

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latTarget.value = position.coords.latitude
          this.lngTarget.value = position.coords.longitude

          this.element.requestSubmit()
        },
        (error) => {
          this.loadingIconTarget.classList.add("hidden")
          this.loadingIconTarget.classList.remove("animate-spin")
          this.loadingTextTarget.innerText = "Check In"
          this.element.disable = false

          switch (error.code) {
            case error.PERMISSION_DENIED:
              alert("You denied the request for Geolocation.")
              break
            case error.POSITION_UNAVAILABLE:
              alert("Location information is unavailable.")
              break
            case error.TIMEOUT:
              alert("The request to get user location timed out.")
              break
            case error.UNKNOWN_ERROR:
              alert("An unknown error occurred.")
              break
          }
        }
      )
    }
  }
}
