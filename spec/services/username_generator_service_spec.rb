require "rails_helper"

RSpec.describe UsernameGeneratorService do
  describe ".call" do
    it "generates username from email" do
      username = UsernameGeneratorService.call(email: "john.doe@example.com")
      expect(username).to eq("johndoe")
    end

    it "handles existing usernames by adding counter" do
      create(:user, username: "johndoe")
      username = UsernameGeneratorService.call(email: "john.doe@example.com")
      expect(username).to eq("johndoe1")
    end

    it "continues incrementing counter for multiple collisions" do
      create(:user, username: "johndoe")
      create(:user, username: "johndoe1")
      create(:user, username: "johndoe2")

      username = UsernameGeneratorService.call(email: "john.doe@example.com")
      expect(username).to eq("johndoe3")
    end

    it "handles short email prefixes" do
      username = UsernameGeneratorService.call(email: "ab@example.com")
      expect(username).to eq("ab12345")
    end

    it "handles blank email prefix" do
      username = UsernameGeneratorService.call(email: "@example.com")
      expect(username).to eq("user12345")
    end

    it "handles special characters in email" do
      username = UsernameGeneratorService.call(email: "user-name_123@example.com")
      expect(username).to eq("username12")
    end

    it "ensures minimum length" do
      username = UsernameGeneratorService.call(email: "abc@example.com")
      expect(username).to eq("abc12345")
      expect(username.length).to be >= 5
    end

    it "truncates long usernames to max length" do
      long_username = "verylongusername123456789"
      username = UsernameGeneratorService.call(email: "#{long_username}@example.com")
      expect(username).to eq("verylongus")
      expect(username.length).to eq(10)
    end
  end
end
