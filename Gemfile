source "https://rubygems.org"
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby "3.4.1"

gem "active_decorator" # Decorator
gem "activerecord_cursor_paginate" # Cursor pagination
gem "activerecord-postgis-adapter", github: "rgeo/activerecord-postgis-adapter", branch: "master" # PostGIS adapter for ActiveRecord
gem "ahoy_matey" # analytics
gem "bugsnag" # Error monitoring
gem "bootsnap", require: false # Reduces boot times through caching; required in config/boot.rb
gem "celluloid" # Actor-based concurrent object framework for Ruby
gem "connection_pool" # redis connection pooling
gem "chartkick" # create js charts
gem "devise" # authentication
gem "dry-validation" # validation
gem "dry-monads" # monads
gem "foreman" # process manager
gem "geocoder" # geocoding for ahoy
gem "google-apis-sheets_v4", require: false # Google API client for Sheets
gem "groupdate" # active record helper to group by date/time
gem "hiredis" # redis adapter
gem "http" # http client
gem "resend" # resend emails
gem "image_optim" # Image optimization
gem "image_optim_pack" # Image optimization
gem "image_processing", ">= 1.2" # Image processor
gem "jbuilder" # Build JSON APIs with ease [https://github.com/rails/jbuilder]
gem "kamal", require: false # Deploy with docker
gem "lograge" # Log formatter
gem "newrelic_rpm" # New Relic monitoring
gem "nokogiri" # Parse HTML
gem "pagy", "~> 9.0" # Pagination
gem "paper_trail" # Track changes to the model
gem "pg", "~> 1.1" # Use postgresql as the database for Active Record
gem "puma", "~> 6.0" # Use the Puma web server [https://github.com/puma/puma]
gem "omniauth" # multi-provider authentication
gem "omniauth-facebook" # login using Facebook
gem "omniauth-google-oauth2" # login using Google
gem "omniauth-twitter" # login using Twitter
gem "omniauth-rails_csrf_protection" # Migitate against CSRF in OmniAuth gem
gem "rack-cors" # Enable CORS for API access
gem "rails", "~> 8.0.1"
gem "rails_cloudflare_turnstile", github: "petakopi/rails-cloudflare-turnstile", branch: "rails-v8" # Cloudflare Turnstile (captcha)
gem "redis", "~> 5.0" # Use Redis adapter to run Action Cable in production
gem "rgeo-geojson" # GeoJSON support for RGeo
gem "sidekiq", "<= 8.0.7" # Background jobs
gem "sidekiq-cron" # Sidekiq + Cron
gem "sidekiq-failures" # Monitor failures in Sidekiq
gem "sidekiq-throttled" # Throttle sidekiq jobs
gem "sitemap_generator", github: "kjvarga/sitemap_generator" # Generate sitemap for search engines
gem "skylight" # Performance monitoring tool
gem "sprockets-rails" # The original asset pipeline for Rails [https://github.com/rails/sprockets-rails]
gem "stimulus-rails" # Hotwire's modest JavaScript framework [https://stimulus.hotwired.dev]
gem "telegram-bot-ruby" # Interact with Telegram
gem "thruster", require: false # Thruster is a Ruby library for building and running web applications
gem "tinify" # tinypng.com gem for image processing
gem "tomo-plugin-sidekiq" # tomo plugin for managing sidekiq via systemd
gem "turbo-rails" # Hotwire's SPA-like page accelerator [https://turbo.hotwired.dev]
gem "turbo-mount" # Mount React on Rails
gem "u-case" # Use case pattern
gem "vite_rails" # Vite integration
gem "uuid7" # UUID generator

group :development, :test do
  gem "dotenv-rails" # Load environment variables from .env file
  gem "factory_bot_rails" # Fixtures replacement
  gem "pry" # Debugging tool
  gem "rspec-rails", "~> 6.1" # Test framework
  gem "standard" # ruby code linting
end

group :development do
  gem "web-console" # Use console on exceptions pages [https://github.com/rails/web-console]
  gem "rack-mini-profiler" # Profiler for your development and production Ruby rack apps
  gem "memory_profiler" # Memory profiling
  gem "stackprof" # Stackprof profiling
end

group :test do
  gem "capybara"
  gem "webdrivers", "~> 5.0", require: false
  gem "simplecov", require: false
end

# Locked due to checksum bug
gem "aws-sdk-s3", "1.170", require: false
gem "aws-sdk-core", "3.211"
