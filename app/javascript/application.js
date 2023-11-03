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
