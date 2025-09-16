require "rails_helper"

RSpec.describe "Users::OmniauthCallbacks", type: :request do
  describe "OAuth Authentication" do
    around do |example|
      ClimateControl.modify(
        APPLE_CLIENT_ID: "test.client.id",
        APPLE_TEAM_ID: "TEST123456",
        APPLE_KEY_ID: "TEST123ABC",
        APPLE_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\nTESTKEY\n-----END PRIVATE KEY-----"
      ) do
        example.run
      end
    end

    let(:auth_hash) do
      OmniAuth::AuthHash.new({
        provider: "apple",
        uid: "123456.abcdef.1234",
        info: {
          email: "test@example.com",
          name: "Test User"
        }
      })
    end

    before do
      Rails.application.env_config["omniauth.auth"] = auth_hash
    end

    describe "successful Apple authentication" do
      it "creates a new user when user doesn't exist" do
        expect {
          post "/users/auth/apple/callback"
        }.to change(User, :count).by(1)

        expect(response).to have_http_status(:redirect)

        user = User.last
        expect(user.email).to eq("test@example.com")
        expect(user.auth_providers.count).to eq(1)
        expect(user.auth_providers.first.provider).to eq("apple")
        expect(user.auth_providers.first.uid).to eq("123456.abcdef.1234")
      end

      it "signs in existing user with same email" do
        existing_user = create(:user, email: "test@example.com")

        expect {
          post "/users/auth/apple/callback"
        }.not_to change(User, :count)

        expect(response).to have_http_status(:redirect)

        existing_user.reload
        expect(existing_user.auth_providers.count).to eq(1)
        expect(existing_user.auth_providers.first.provider).to eq("apple")
      end

      it "returns existing user when auth provider already exists" do
        existing_user = create(:user, email: "test@example.com")
        create(:auth_provider, user: existing_user, provider: "apple", uid: "123456.abcdef.1234")

        expect {
          post "/users/auth/apple/callback"
        }.not_to change(AuthProvider, :count)

        expect(response).to have_http_status(:redirect)
      end
    end

    describe "failed authentication" do
      it "redirects to root path when OmniauthHandler raises an error" do
        allow(OmniauthHandler).to receive(:call).and_raise(StandardError.new("Authentication failed"))

        post "/users/auth/apple/callback"

        expect(response).to redirect_to(root_path)
        expect(flash[:alert]).to eq("Authentication failed, please try again.")
      end
    end
  end
end
