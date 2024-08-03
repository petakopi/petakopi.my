import { Controller } from "@hotwired/stimulus"
import { get } from "@rails/request.js"

export default class extends Controller {
  change(event) {
    const url = event.target.value
    const request = get(url, { responseKind: "turbo-stream" })

    request.then((response) => {
      console.log("DONE")
    })
  }
}
