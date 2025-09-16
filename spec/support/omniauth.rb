# OmniAuth test mode configuration
OmniAuth.config.test_mode = true

# Helper methods for OmniAuth testing
module OmniauthTestHelper
  def mock_apple_auth(email: "test@example.com", uid: "123456.abcdef.1234")
    OmniAuth.config.mock_auth[:apple] = OmniAuth::AuthHash.new({
      provider: "apple",
      uid: uid,
      info: {
        email: email,
        name: "Test User"
      }
    })
  end

  def mock_google_auth(email: "test@gmail.com", uid: "123456789")
    OmniAuth.config.mock_auth[:google_oauth2] = OmniAuth::AuthHash.new({
      provider: "google_oauth2",
      uid: uid,
      info: {
        email: email,
        name: "Test User"
      }
    })
  end

  def mock_auth_failure(provider)
    OmniAuth.config.mock_auth[provider] = :invalid_credentials
  end

  def clear_mock_auth
    OmniAuth.config.mock_auth.clear
  end
end

RSpec.configure do |config|
  config.include OmniauthTestHelper, type: :request

  config.after(:each, type: :request) do
    clear_mock_auth
  end
end
