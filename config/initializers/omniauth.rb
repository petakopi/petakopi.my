Rails.application.config.middleware.use OmniAuth::Builder do
  provider :developer unless Rails.env.production?

  provider(
    :google_oauth2,
    Rails.application.credentials.dig(:google_oauth, :client_id),
    Rails.application.credentials.dig(:google_oauth, :client_secret)
  )
end
