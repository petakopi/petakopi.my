import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    if (document.querySelector(".cf-turnstile") && window.turnstile) {
      window.turnstile.render(".cf-turnstile");
    }
  }
}
