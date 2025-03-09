// Core framework imports
import "@hotwired/turbo-rails";
import { Turbo } from "@hotwired/turbo-rails";
import "@rails/actiontext";
import "trix";

// Alpine.js and its plugins
import Alpine from "alpinejs";
import Tooltip from "@ryangjchandler/alpine-tooltip";
import focus from '@alpinejs/focus';

// Other JS libraries
import "ahoy.js";
import "chartkick/chart.js"

// Page transition utilities
import Turn from "@domchristie/turn";

// Local imports
import "../tailwind.alpine";
import "../turbo-mount"

/**
 * Turbo Configuration
 */
const configureTurbo = () => {
  Turbo.setProgressBarDelay(100);

  document.addEventListener("turbo:frame-missing", (event) => {
    const { detail: { response, visit } } = event;
    event.preventDefault();
    visit(response);
  });
};

/**
 * Turn.js Configuration
 */
const configureTurn = () => {
  Turn.config.experimental.viewTransitions = true;
  Turn.start();
};

/**
 * Alpine.js Configuration
 */
const configureAlpine = () => {
  Alpine.plugin(Tooltip);
  Alpine.plugin(focus);
  window.Alpine = Alpine;
  Alpine.start();
};

/**
 * Google Maps callback handler
 */
window.dispatchMapsFormEvent = function(...args) {
  const event = new Event("google-maps-callback", {
    bubbles: true,
    cancelable: true
  });
  event.args = args;
  document.dispatchEvent(event);
};

/**
 * PWA Installation handler
 */
const configurePWA = () => {
  window.addEventListener("beforeinstallprompt", (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    window.deferredPrompt = e;
  });
};

// Initialize all configurations
configureTurbo();
configureTurn();
configureAlpine();
configurePWA();
