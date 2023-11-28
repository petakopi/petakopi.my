import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "counter",
    "searchBox",
    "keyword",
    "district",
    "state",
    "tags"
  ]

  count = 0

  connect() {
    this._setCounter()
  }

  toggle(e) {
    this._setCounter()
    this.searchBoxTarget.classList.toggle("hidden")

    if (this.count > 0) {
      this.counterTarget.classList.toggle("hidden")
    }
  }

  _setCounter() {
    this.count = 0

    const inputs = [
      this.keywordTarget,
      this.districtTarget,
      this.stateTarget,
      this.tagsTarget
    ]

    inputs.forEach(input => {
      if (input.value != "") {
        this.count = this.count + 1
      }
    });

    this.counterTarget.innerHTML = this.count
  }
}
