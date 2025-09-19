// Import all necessary dependencies
import plugin, { TurboMount } from "turbo-mount/react"
import { registerComponents } from "turbo-mount/registerComponents/vite"
import { Application } from "@hotwired/stimulus"
import { registerControllers } from "stimulus-vite-helpers"

// Initialize both frameworks
const turboMount = new TurboMount()
const application = Application.start()

// Get all controllers and components
const controllers = import.meta.glob("./controllers/**/*_controller.js", {
  eager: true,
})
const components = import.meta.glob("./components/**/*.jsx", { eager: true })

// Register everything in one place
registerComponents({
  plugin,
  turboMount,
  components,
  controllers,
})

// Register the same controllers with Stimulus
// Note: Can't combine them for unknown reasons
registerControllers(application, controllers)

// to register a component use:
// registerComponent(turboMount, "Hello", Hello); // where Hello is the imported the component

// to override the default controller use:
// registerComponent(turboMount, "Hello", Hello, HelloController); // where HelloController is a Stimulus controller extended from TurboMountController

// If you want to automatically register components use:
// import { registerComponents } from "turbo-mount/registerComponents/react";
// const controllers = import.meta.glob("/controllers/**/*_controller.js", { eager: true });
// const components = import.meta.glob("/components/**/*.jsx", { eager: true });
// registerComponents({ turboMount, components, controllers });
