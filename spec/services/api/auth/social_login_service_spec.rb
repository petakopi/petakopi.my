require "rails_helper"

RSpec.describe Api::Auth::SocialLoginService do
  let(:id_token) { "valid-token" }
  let(:user) { create(:user) }
  let(:successful_result) do
    {
      success: true,
      token: "jwt-token",
      user: user
    }
  end
  let(:error_result) do
    {
      success: false,
      error: "Authentication failed"
    }
  end

  describe "#call" do
    context "with Google provider" do
      let(:service) { described_class.new("google", id_token) }

      it "delegates to GoogleAuthenticator" do
        expect_any_instance_of(Api::Auth::GoogleAuthenticator)
          .to receive(:call).and_return(successful_result)

        result = service.call
        expect(result).to eq(successful_result)
      end
    end

    context "with Apple provider" do
      let(:service) { described_class.new("apple", id_token) }

      it "delegates to AppleAuthenticator" do
        expect_any_instance_of(Api::Auth::AppleAuthenticator)
          .to receive(:call).and_return(successful_result)

        result = service.call
        expect(result).to eq(successful_result)
      end
    end

    context "with uppercase provider name" do
      let(:service) { described_class.new("GOOGLE", id_token) }

      it "normalizes provider name and delegates correctly" do
        expect_any_instance_of(Api::Auth::GoogleAuthenticator)
          .to receive(:call).and_return(successful_result)

        result = service.call
        expect(result).to eq(successful_result)
      end
    end

    context "with unsupported provider" do
      let(:service) { described_class.new("facebook", id_token) }

      it "returns error for unsupported provider" do
        result = service.call

        expect(result[:success]).to be false
        expect(result[:error]).to eq("Unsupported provider: facebook")
      end
    end
  end
end
