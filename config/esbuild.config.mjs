#!/usr/bin/env node

import * as esbuild from 'esbuild'
import rails from 'esbuild-rails'
import path from 'path'
import { exec } from 'child_process'

const entryPoints = [
  'application.js',
  'chart.js',
  'tailwind.alpine.js',
  'service-worker.js'
]
const watchDirectories = [
  './app/javascript/**/*.js',
  './app/views/**/*.html.erb',
  './app/assets/builds/**/*.css' // Wait for cssbundling changes
]

const config = {
  absWorkingDir: path.join(process.cwd(), 'app/javascript'),
  outdir: 'builds',
  bundle: true,
  entryPoints: entryPoints,
  minify: process.env.RAILS_ENV == 'production',
  outdir: path.join(process.cwd(), 'app/assets/builds'),
  plugins: [rails()],
  sourcemap: process.argv.includes('--sourcemap')
}

if (process.argv.includes('--watch')) {
  let context = await esbuild.context({ ...config, logLevel: 'info' })
  console.log(
    `⚡ Build node esbuild for ${process.env.RAILS_ENV} complete! ⚡, watching...`
  )
  exec('workbox injectManifest config/workbox.config.js')
  context.watch()
} else {
  esbuild.build(config).catch(error => {
    console.error(error)
    process.exit(1)
  })
  exec('workbox injectManifest config/workbox.config.js')
  console.log(`⚡ Build node esbuild for ${process.env.RAILS_ENV} complete! ⚡`)
}
