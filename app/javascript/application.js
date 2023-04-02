// NPM libraries
import "@hotwired/turbo-rails"
import "trix"
import "@rails/actiontext"
import "ahoy.js"

// Alpine
import Alpine from "alpinejs"
import Tooltip from "@ryangjchandler/alpine-tooltip";

// Locals
import "./controllers"
import "./tailwind.alpine"

// Others
Alpine.plugin(Tooltip);
window.Alpine = Alpine

Alpine.start()
