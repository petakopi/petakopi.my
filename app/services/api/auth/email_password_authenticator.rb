module Api
  module Auth
    class EmailPasswordAuthenticator
      def initialize(email, password)
        @email = email
        @password = password
      end

      def call
        if user&.valid_password?(password)
          {
            success: true,
            user: user
          }
        else
          {
            success: false,
            error: "Invalid credentials"
          }
        end
      end

      private

      attr_reader :email, :password

      def user
        @user ||= User.find_by(email: email)
      end
    end
  end
end
