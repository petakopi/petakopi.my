// NPM libraries
import "@hotwired/turbo-rails"
import "trix"
import "@rails/actiontext"
import "ahoy.js"

// Alpine
import Alpine from "alpinejs"
import Tooltip from "@ryangjchandler/alpine-tooltip";


// The default of 500ms is too long
import { Turbo } from "@hotwired/turbo-rails"

Turbo.setProgressBarDelay(100)

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
