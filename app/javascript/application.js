// NPM libraries
import "@hotwired/turbo-rails"
import Alpine from "alpinejs"
import "trix"
import "@rails/actiontext"

// Locals
import "./controllers"
import "./tailwind.alpine"

// Others
window.Alpine = Alpine

Alpine.start()
