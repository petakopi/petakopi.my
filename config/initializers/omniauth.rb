Rails.application.config.middleware.use OmniAuth::Builder do
  provider :developer unless Rails.env.production?

  provider(
    :google_oauth2,
    ENV["GOOGLE_OAUTH_CLIENT_ID"],
    ENV["GOOGLE_OAUTH_CLIENT_SECRET"]
  )

  # Simplified Apple configuration for development
  if ENV["APPLE_CLIENT_ID"].present?
    provider :apple,
      ENV.fetch("APPLE_CLIENT_ID"),
      {
        scope: "email",
        team_id: ENV.fetch("APPLE_TEAM_ID"),
        key_id: ENV.fetch("APPLE_KEY_ID"),
        pem: ENV.fetch("APPLE_PRIVATE_KEY").gsub('\n', "\n"),
        provider_ignores_state: true,
        nonce: :local
      }
  end
end
