require "rails_helper"

RSpec.describe Api::UserPresenter do
  let(:user) { create(:user, email: "test@example.com", username: "testuser") }
  let(:presenter) { described_class.new(user) }

  describe "#profile" do
    it "returns user profile data" do
      profile = presenter.profile

      expect(profile[:id]).to eq(user.uuid)
      expect(profile[:email]).to eq("test@example.com")
      expect(profile[:username]).to eq("testuser")
      expect(profile).to have_key(:avatar_url)
    end

    it "includes avatar_url as nil when no avatar is attached" do
      profile = presenter.profile
      expect(profile[:avatar_url]).to be_nil
    end

    context "when user has avatar" do
      before do
        user.avatar.attach(
          io: File.open(Rails.root.join("spec", "fixtures", "files", "avatar.jpg")),
          filename: "avatar.jpg",
          content_type: "image/jpeg"
        )
      end

      it "includes avatar_url when avatar is attached" do
        profile = presenter.profile
        expect(profile[:avatar_url]).to be_present
        expect(profile[:avatar_url]).to start_with("/rails/active_storage/blobs/")
      end
    end

    it "returns a hash with symbol keys" do
      profile = presenter.profile
      expect(profile.keys).to all(be_a(Symbol))
    end

    it "includes all expected fields" do
      profile = presenter.profile
      expected_fields = [:id, :email, :username, :avatar_url]
      expect(profile.keys).to match_array(expected_fields)
    end
  end
end