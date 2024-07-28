Bugsnag.configure do |config|
  config.enabled_release_stages = ["production"]
  config.api_key = Rails.application.credentials.dig(:bugsnag)
end
