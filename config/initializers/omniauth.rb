Rails.application.config.middleware.use OmniAuth::Builder do
  provider :developer unless Rails.env.production?

  provider(
    :facebook,
    Rails.application.credentials.dig(:facebook, :app_id),
    Rails.application.credentials.dig(:facebook, :app_secret)
  )
  provider(
    :twitter,
    Rails.application.credentials.dig(:twitter, :api_key),
    Rails.application.credentials.dig(:twitter, :api_key_secret)
  )
end
