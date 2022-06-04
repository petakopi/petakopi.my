source "https://rubygems.org"
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby "3.1.0"

gem "active_decorator" # Decorator
gem "ahoy_matey" # analytics
gem "appsignal" # error/performance monitoring
gem "aws-sdk-s3", require: false
gem "bootsnap", require: false # Reduces boot times through caching; required in config/boot.rb
gem "connection_pool" # redis connection pooling
gem "cssbundling-rails" # Bundle and process CSS [https://github.com/rails/cssbundling-rails]
gem "devise" # authentication
gem "geocoder" # geocoding for ahoy
gem "hiredis" # redis adapter
gem "image_optim" # Image optimization
gem "image_optim_pack" # Image optimization
gem "image_processing", ">= 1.2" # Image processor
gem "jbuilder" # Build JSON APIs with ease [https://github.com/rails/jbuilder]
gem "jsbundling-rails" # Bundle and transpile JavaScript [https://github.com/rails/jsbundling-rails]
gem "nokogiri" # Parse HTML
gem "pagy", "~> 5.10" # Pagination
gem "paper_trail" # Track changes to the model
gem "pg", "~> 1.1" # Use postgresql as the database for Active Record
gem "puma", "~> 5.0" # Use the Puma web server [https://github.com/puma/puma]
gem "omniauth" # multi-provider authentication
gem "omniauth-facebook" # login using Facebook
gem "omniauth-google-oauth2" # login using Google
gem "omniauth-twitter" # login using Twitter
gem "omniauth-rails_csrf_protection" # Migitate against CSRF in OmniAuth gem
gem "rails"
gem "redis", "~> 4.0" # Use Redis adapter to run Action Cable in production
gem "sidekiq" # Background jobs
gem "sidekiq-cron" # Sidekiq + Cron
gem "sidekiq-failures" # Monitor failures in Sidekiq
gem "sitemap_generator" # Generate sitemap for search engines
gem "skylight" # Performance monitoring tool
gem "sprockets-rails" # The original asset pipeline for Rails [https://github.com/rails/sprockets-rails]
gem "stimulus-rails" # Hotwire's modest JavaScript framework [https://stimulus.hotwired.dev]
gem "tinify" # tinypng.com gem for image processing
gem "tomo-plugin-sidekiq" # tomo plugin for managing sidekiq via systemd
gem "turbo-rails" # Hotwire's SPA-like page accelerator [https://turbo.hotwired.dev]

group :development, :test do
  gem "pry" # Debugging tool
  gem "standard" # ruby code linting
end

group :development do
  gem "web-console" # Use console on exceptions pages [https://github.com/rails/web-console]
end

group :test do
  gem "capybara"
  gem "selenium-webdriver"
  gem "webdrivers"
end
