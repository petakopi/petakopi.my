import { defineConfig } from "vite"
import RubyPlugin from "vite-plugin-ruby"
import FullReload from "vite-plugin-full-reload";
import StimulusHMR from "vite-plugin-stimulus-hmr";
import react from '@vitejs/plugin-react'

export default defineConfig({
  clearScreen: false,
  plugins: [
    RubyPlugin(),
    FullReload(["config/routes.rb", "app/views/**/*"], { delay: 200 }),
    StimulusHMR(),
    react(),
  ],
  css: {
    postcss: "./config/postcss.config.mjs"
  }
})
