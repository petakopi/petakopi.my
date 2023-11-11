import { Controller } from "@hotwired/stimulus"
import ahoy from "ahoy.js"

export default class extends Controller {
  install() {
    // Show the Prompt
    window.deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    window.deferredPrompt.userChoice.then((choiceResult) => {
      ahoy.track(
        "PWA",
        {accepted: choiceResult.outcome === 'accepted'}
      )

      window.deferredPrompt = null;
    });
  }
}
