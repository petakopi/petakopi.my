import { Controller } from "@hotwired/stimulus"
import ahoy from "ahoy.js"

export default class extends Controller {
  static values = {
    url: String,
    type: String,
  }

  track(event) {
    ahoy.track("Click Link", {type: this.typeValue, url: this.urlValue})
  }
}
