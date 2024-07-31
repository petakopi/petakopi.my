Rails.application.config.middleware.use OmniAuth::Builder do
  provider :developer unless Rails.env.production?

  provider(
    :google_oauth2,
    ENV["GOOGLE_OAUTH_CLIENT_ID"],
    ENV["GOOGLE_OAUTH_CLIENT_SECRET"]
  )
end
