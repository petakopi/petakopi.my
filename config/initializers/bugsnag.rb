Bugsnag.configure do |config|
  config.enabled_release_stages = ["production"]
  config.api_key = ENV["BUGSNAG_API_KEY"]
end
