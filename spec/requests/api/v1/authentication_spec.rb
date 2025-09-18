require "rails_helper"

RSpec.describe "Api::V1::Authentication", type: :request do
  describe "POST /api/v1/auth/login" do
    context "with Google provider" do
      context "with valid Google ID token" do
        let(:valid_google_payload) do
          {
            "sub" => "google-user-123",
            "email" => "new@example.com",
            "email_verified" => true
          }
        end

        before do
          allow_any_instance_of(Api::Auth::GoogleAuthenticator).to receive(:verify_token).and_return(valid_google_payload)
        end

        it "creates a new user and returns token" do
          expect {
            post "/api/v1/auth/login", params: {provider: "google", id_token: "valid-google-token"}
          }.to change(User, :count).by(1)
            .and change(AuthProvider, :count).by(1)

          expect(response).to have_http_status(:ok)
          expect(response.content_type).to include("application/json")

          # Devise-JWT puts the token in the Authorization header
          expect(response.headers["Authorization"]).to be_present
          expect(response.headers["Authorization"]).to start_with("Bearer ")

          json_response = JSON.parse(response.body)
          expect(json_response).to have_key("user")
          expect(json_response["user"]["email"]).to eq("new@example.com")
          expect(json_response["user"]["username"]).to be_present
          expect(json_response["user"]["id"]).to match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
        end

        it "accepts uppercase provider name" do
          expect {
            post "/api/v1/auth/login", params: {provider: "GOOGLE", id_token: "valid-google-token"}
          }.to change(User, :count).by(1)

          expect(response).to have_http_status(:ok)
        end

        context "when user already exists with same email" do
          let!(:existing_user) { create(:user, email: "existing@example.com") }
          let(:existing_user_payload) do
            {
              "sub" => "google-user-456",
              "email" => "existing@example.com",
              "email_verified" => true
            }
          end

          before do
            allow_any_instance_of(Api::Auth::GoogleAuthenticator).to receive(:verify_token).and_return(existing_user_payload)
          end

          it "returns existing user with new auth provider" do
            expect {
              post "/api/v1/auth/login", params: {provider: "google", id_token: "valid-google-token"}
            }.to change(User, :count).by(0)
              .and change(AuthProvider, :count).by(1)

            expect(response).to have_http_status(:ok)
            expect(response.headers["Authorization"]).to be_present
            json_response = JSON.parse(response.body)
            expect(json_response["user"]["id"]).to eq(existing_user.uuid)
            expect(json_response["user"]["email"]).to eq("existing@example.com")
          end
        end

        context "when user already has Google auth provider" do
          let!(:existing_user) { create(:user, email: "existing@example.com") }
          let!(:auth_provider) { create(:auth_provider, user: existing_user, provider: "google_oauth2", uid: "google-user-456") }

          let(:existing_auth_payload) do
            {
              "sub" => "google-user-456",
              "email" => "existing@example.com",
              "email_verified" => true
            }
          end

          before do
            allow_any_instance_of(Api::Auth::GoogleAuthenticator).to receive(:verify_token).and_return(existing_auth_payload)
          end

          it "returns existing user without creating duplicate auth provider" do
            expect {
              post "/api/v1/auth/login", params: {provider: "google", id_token: "valid-google-token"}
            }.to change(User, :count).by(0)
              .and change(AuthProvider, :count).by(0)

            expect(response).to have_http_status(:ok)
            expect(response.headers["Authorization"]).to be_present
            json_response = JSON.parse(response.body)
            expect(json_response["user"]["id"]).to eq(existing_user.uuid)
          end
        end
      end

      context "with invalid Google ID token" do
        before do
          allow_any_instance_of(Api::Auth::GoogleAuthenticator).to receive(:verify_token).and_raise(StandardError.new("Invalid token"))
        end

        it "returns authentication error" do
          post "/api/v1/auth/login", params: {provider: "google", id_token: "invalid-google-token"}

          expect(response).to have_http_status(:unauthorized)
          expect(response.content_type).to include("application/json")

          json_response = JSON.parse(response.body)
          expect(json_response["error"]).to eq("Invalid Google token")
        end
      end
    end

    context "with Apple provider" do
      context "with valid Apple ID token" do
        let(:valid_apple_payload) do
          {
            "sub" => "apple-user-789",
            "email" => "apple@example.com"
          }
        end

        before do
          allow_any_instance_of(Api::Auth::AppleAuthenticator).to receive(:verify_token).and_return(valid_apple_payload)
        end

        it "creates a new user and returns token" do
          expect {
            post "/api/v1/auth/login", params: {provider: "apple", id_token: "valid-apple-token"}
          }.to change(User, :count).by(1)
            .and change(AuthProvider, :count).by(1)

          expect(response).to have_http_status(:ok)
          expect(response.content_type).to include("application/json")

          # Devise-JWT puts the token in the Authorization header
          expect(response.headers["Authorization"]).to be_present
          expect(response.headers["Authorization"]).to start_with("Bearer ")

          json_response = JSON.parse(response.body)
          expect(json_response).to have_key("user")
          expect(json_response["user"]["email"]).to eq("apple@example.com")
          expect(json_response["user"]["username"]).to be_present
          expect(json_response["user"]["id"]).to match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)

          # Verify auth provider was created
          auth_provider = AuthProvider.last
          expect(auth_provider.provider).to eq("apple")
          expect(auth_provider.uid).to eq("apple-user-789")
        end

        it "accepts uppercase provider name" do
          expect {
            post "/api/v1/auth/login", params: {provider: "APPLE", id_token: "valid-apple-token"}
          }.to change(User, :count).by(1)

          expect(response).to have_http_status(:ok)
        end

        context "when user already exists with same email" do
          let!(:existing_user) { create(:user, email: "apple@example.com") }

          it "returns existing user with new auth provider" do
            expect {
              post "/api/v1/auth/login", params: {provider: "apple", id_token: "valid-apple-token"}
            }.to change(User, :count).by(0)
              .and change(AuthProvider, :count).by(1)

            expect(response).to have_http_status(:ok)
            expect(response.headers["Authorization"]).to be_present
            json_response = JSON.parse(response.body)
            expect(json_response["user"]["id"]).to eq(existing_user.uuid)
            expect(json_response["user"]["email"]).to eq("apple@example.com")
          end
        end
      end

      context "with invalid Apple ID token" do
        before do
          allow_any_instance_of(Api::Auth::AppleAuthenticator).to receive(:verify_token).and_raise(StandardError.new("Invalid token"))
        end

        it "returns authentication error" do
          post "/api/v1/auth/login", params: {provider: "apple", id_token: "invalid-apple-token"}

          expect(response).to have_http_status(:unauthorized)
          expect(response.content_type).to include("application/json")

          json_response = JSON.parse(response.body)
          expect(json_response["error"]).to eq("Invalid Apple token")
        end
      end
    end

    context "with unsupported provider" do
      it "returns error for unsupported provider" do
        post "/api/v1/auth/login", params: {provider: "facebook", id_token: "some-token"}

        expect(response).to have_http_status(:unauthorized)
        json_response = JSON.parse(response.body)
        expect(json_response["error"]).to eq("Unsupported provider: facebook")
      end
    end

    context "without provider" do
      it "returns bad request error" do
        post "/api/v1/auth/login", params: {id_token: "some-token"}

        expect(response).to have_http_status(:bad_request)
        json_response = JSON.parse(response.body)
        expect(json_response["error"]).to eq("Missing provider or id_token")
      end
    end

    context "without ID token" do
      it "returns bad request error" do
        post "/api/v1/auth/login", params: {provider: "google"}

        expect(response).to have_http_status(:bad_request)
        json_response = JSON.parse(response.body)
        expect(json_response["error"]).to eq("Missing provider or id_token")
      end
    end

    context "without any parameters" do
      it "returns bad request error" do
        post "/api/v1/auth/login", params: {}

        expect(response).to have_http_status(:bad_request)
        json_response = JSON.parse(response.body)
        expect(json_response["error"]).to eq("Missing provider or id_token")
      end
    end
  end
end