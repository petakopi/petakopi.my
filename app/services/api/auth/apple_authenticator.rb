require "net/http"

module Api
  module Auth
    class AppleAuthenticator
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
        Rails.logger.error "Apple mobile auth error: #{e.message}"
        {
          success: false,
          error: "Invalid Apple token"
        }
      end

      private

      attr_reader :id_token

      def verify_token
        # Decode the JWT token without verification first to get the kid
        JWT.decode(id_token, nil, false)
        header = JWT.decode(id_token, nil, false, {algorithm: "none"}).last

        # Get Apple's public keys
        jwks = fetch_apple_public_keys
        key = find_key(jwks, header["kid"])

        # Verify the token
        JWT.decode(
          id_token,
          key,
          true,
          {
            algorithm: "RS256",
            iss: "https://appleid.apple.com",
            aud: ENV["APPLE_CLIENT_ID"],
            verify_iss: true,
            verify_aud: true
          }
        ).first
      end

      def fetch_apple_public_keys
        uri = URI("https://appleid.apple.com/auth/keys")
        response = Net::HTTP.get_response(uri)
        JSON.parse(response.body)
      end

      def find_key(jwks, kid)
        key_data = jwks["keys"].find { |key| key["kid"] == kid }
        raise "Key not found" unless key_data

        # Convert JWK to PEM format
        jwk = JWT::JWK.import(key_data)
        jwk.keypair
      end

      def build_omniauth_payload(token_payload)
        {
          "provider" => "apple",
          "uid" => token_payload["sub"],
          "info" => {
            "email" => token_payload["email"],
            "name" => token_payload["name"] # Apple might not always provide this
          }
        }
      end
    end
  end
end
