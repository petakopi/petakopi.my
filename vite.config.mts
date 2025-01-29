import { defineConfig } from "vite"
import RubyPlugin from "vite-plugin-ruby"
import FullReload from "vite-plugin-full-reload";
import StimulusHMR from "vite-plugin-stimulus-hmr";

export default defineConfig({
  clearScreen: false,
  plugins: [
    RubyPlugin(),
    FullReload(["config/routes.rb", "app/views/**/*"], { delay: 200 }),
    StimulusHMR(),
  ],
  css: {
    postcss: "./config/postcss.config.mjs"
  }
})
