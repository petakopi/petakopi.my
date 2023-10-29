// NPM libraries
import "@hotwired/turbo-rails"
import "trix"
import "@rails/actiontext"
import "ahoy.js"

// Alpine
import Alpine from "alpinejs"
import Tooltip from "@ryangjchandler/alpine-tooltip";

import { Turbo } from "@hotwired/turbo-rails"
Turbo.setProgressBarDelay(100)

window.dispatchMapsFormEvent = function (...args) {
  const event = new Event("google-maps-callback", { bubbles: true, cancelable: true });
  event.args = args;

  document.dispatchEvent(event);
};

// Locals
import "./controllers"
import "./tailwind.alpine"

// Others
Alpine.plugin(Tooltip);
window.Alpine = Alpine

Alpine.start()

// PWA Installation
window.addEventListener("beforeinstallprompt", (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later.
  window.deferredPrompt = e;
});
