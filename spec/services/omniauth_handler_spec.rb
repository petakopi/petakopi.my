require "rails_helper"

RSpec.describe OmniauthHandler do
  describe "#call" do
    let(:auth_payload) do
      {
        "provider" => "apple",
        "uid" => "123456",
        "info" => {
          "email" => "test@example.com",
          "name" => "Test User"
        }
      }
    end

    context "when user does not exist" do
      it "creates a new user with email from auth payload" do
        expect {
          OmniauthHandler.call(payload: auth_payload)
        }.to change(User, :count).by(1)

        user = User.last
        expect(user.email).to eq("test@example.com")
        expect(user.username).to start_with("user")
      end

      it "creates an auth provider record" do
        expect {
          OmniauthHandler.call(payload: auth_payload)
        }.to change(AuthProvider, :count).by(1)

        auth = AuthProvider.last
        expect(auth.provider).to eq("apple")
        expect(auth.uid).to eq("123456")
      end
    end

    context "when user already exists with same email" do
      let!(:existing_user) { create(:user, email: "test@example.com") }

      it "does not create a new user" do
        expect {
          OmniauthHandler.call(payload: auth_payload)
        }.not_to change(User, :count)
      end

      it "creates auth provider for existing user" do
        result = OmniauthHandler.call(payload: auth_payload)

        expect(result).to eq(existing_user)
        expect(existing_user.auth_providers.count).to eq(1)
        expect(existing_user.auth_providers.first.provider).to eq("apple")
      end
    end

    context "when auth provider already exists" do
      let!(:existing_user) { create(:user, email: "test@example.com") }
      let!(:existing_auth) { create(:auth_provider, user: existing_user, provider: "apple", uid: "123456") }

      it "does not create duplicate auth provider" do
        expect {
          OmniauthHandler.call(payload: auth_payload)
        }.not_to change(AuthProvider, :count)
      end

      it "returns the existing user" do
        result = OmniauthHandler.call(payload: auth_payload)
        expect(result).to eq(existing_user)
      end
    end
  end
end
