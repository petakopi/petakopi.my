require "rails_helper"

RSpec.describe "Api::V1::Users", type: :request do
  let!(:user) { create(:user, email: "test@example.com") }

  def get_jwt_token_for_user(user)
    # Mock Google authentication to get JWT token
    allow_any_instance_of(Api::Auth::GoogleAuthenticator)
      .to receive(:verify_token)
      .and_return({"sub" => "google-123", "email" => user.email, "email_verified" => true})

    allow(OmniauthHandler)
      .to receive(:call)
      .and_return(user)

    post "/api/v1/auth/login", params: {provider: "google", id_token: "valid-google-token"}
    response.headers["Authorization"]
  end

  describe "GET /api/v1/account/profile" do
    context "when authenticated" do
      let(:jwt_token) { get_jwt_token_for_user(user) }

      it "returns user profile" do
        get "/api/v1/account/profile", headers: {
          "Authorization" => jwt_token
        }

        expect(response).to have_http_status(:ok)
        expect(response.content_type).to include("application/json")

        json_response = JSON.parse(response.body)
        expect(json_response["user"]["id"]).to eq(user.uuid)
        expect(json_response["user"]["email"]).to eq(user.email)
        expect(json_response["user"]["username"]).to eq(user.username)
        expect(json_response["user"]).to have_key("avatar_url")
      end

      context "when user has avatar" do
        before do
          user.avatar.attach(
            io: File.open(Rails.root.join("spec", "fixtures", "files", "avatar.jpg")),
            filename: "avatar.jpg",
            content_type: "image/jpeg"
          )
        end

        it "returns avatar URL" do
          get "/api/v1/account/profile", headers: {
            "Authorization" => jwt_token
          }

          expect(response).to have_http_status(:ok)
          json_response = JSON.parse(response.body)
          expect(json_response["user"]["avatar_url"]).to be_present
        end
      end
    end

    context "when not authenticated" do
      it "returns unauthorized error for invalid token" do
        get "/api/v1/account/profile", headers: {
          "Authorization" => "Bearer invalid-token"
        }

        expect(response).to have_http_status(:unauthorized)
      end

      it "returns unauthorized error without token" do
        get "/api/v1/account/profile"

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
