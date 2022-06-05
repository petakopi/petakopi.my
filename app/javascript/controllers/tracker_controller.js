import { Controller } from "@hotwired/stimulus"
import ahoy from "ahoy.js"

export default class extends Controller {
  static values = {
    url: String,
    type: String,
    id: Number,
  }

  track(event) {
    ahoy.track("Click Link", {id: this.idValue, type: this.typeValue, url: this.urlValue})
  }
}
