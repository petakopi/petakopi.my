require "google-id-token"

module Api
  module Auth
    class GoogleAuthenticator
      def initialize(id_token)
        @id_token = id_token
      end

      def call
        token_payload = verify_token

        # Convert to Omniauth-style payload
        omniauth_payload = build_omniauth_payload(token_payload)

        # Use existing OmniauthHandler for user creation/lookup
        user = OmniauthHandler.call(payload: omniauth_payload)

        {
          success: true,
          user: user
        }
      rescue => e
        Rails.logger.error "Google mobile auth error: #{e.message}"
        {
          success: false,
          error: "Invalid Google token"
        }
      end

      private

      attr_reader :id_token

      def verify_token
        validator = GoogleIDToken::Validator.new
        payload = validator.check(id_token, audience)

        raise "Invalid token" unless payload

        payload
      end

      def audience
        # Use your Google OAuth client ID for mobile app
        ENV["GOOGLE_OAUTH_CLIENT_ID"] || ENV["GOOGLE_CLIENT_ID"]
      end

      def build_omniauth_payload(token_payload)
        {
          "provider" => "google_oauth2",
          "uid" => token_payload["sub"],
          "info" => {
            "email" => token_payload["email"],
            "name" => token_payload["name"]
          }
        }
      end
    end
  end
end
