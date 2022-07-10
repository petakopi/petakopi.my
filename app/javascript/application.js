// NPM libraries
import "@hotwired/turbo-rails"
import Alpine from "alpinejs"
import "trix"
import "@rails/actiontext"
import "ahoy.js"
import "chartkick/chart.js"

// Locals
import "./controllers"
import "./tailwind.alpine"

// Others
window.Alpine = Alpine

Alpine.start()
