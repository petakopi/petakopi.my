import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "buttonGroup",
    "iframe",
  ]
  static values = {
    gmap: String,
    src: String,
  }

  load() {
    this.iframeTarget.src = this.srcValue

    this.iframeTarget.classList.remove("hidden")
    this.buttonGroupTarget.classList.add("hidden")
  }

  openMap() {
    window.open(this.gmapValue, "_blank")
  }
}
