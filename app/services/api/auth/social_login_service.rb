module Api
  module Auth
    class SocialLoginService
      def initialize(provider, id_token)
        @provider = provider.to_s.downcase
        @id_token = id_token
      end

      def call
        case @provider
        when "google"
          GoogleAuthenticator.new(@id_token).call
        when "apple"
          AppleAuthenticator.new(@id_token).call
        else
          {
            success: false,
            error: "Unsupported provider: #{@provider}"
          }
        end
      end

      private

      attr_reader :provider, :id_token
    end
  end
end
