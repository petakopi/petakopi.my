require "rails_helper"

RSpec.describe "Api::V1::Filters", type: :request do
  describe "GET /api/v1/filters" do
    context "when section is states" do
      let!(:coffee_shop1) { create(:coffee_shop, state: "Kuala Lumpur", status: :published) }
      let!(:coffee_shop2) { create(:coffee_shop, state: "Selangor", status: :published) }
      let!(:coffee_shop3) { create(:coffee_shop, state: "Kuala Lumpur", status: :published) }

      it "returns unique states from published coffee shops" do
        get "/api/v1/filters", params: {section: "states"}

        expect(response).to have_http_status(:ok)
        expect(response.content_type).to include("application/json")

        json_response = JSON.parse(response.body)
        expect(json_response).to contain_exactly("Kuala Lumpur", "Selangor")
      end

      it "excludes states from unpublished coffee shops" do
        create(:coffee_shop, state: "Johor", status: :unpublished)

        get "/api/v1/filters", params: {section: "states"}

        json_response = JSON.parse(response.body)
        expect(json_response).not_to include("Johor")
      end
    end

    context "when section is districts" do
      let!(:coffee_shop1) { create(:coffee_shop, state: "Kuala Lumpur", district: "KLCC", status: :published) }
      let!(:coffee_shop2) { create(:coffee_shop, state: "Kuala Lumpur", district: "Bukit Bintang", status: :published) }
      let!(:coffee_shop3) { create(:coffee_shop, state: "Selangor", district: "Petaling Jaya", status: :published) }

      it "returns districts for the specified state" do
        get "/api/v1/filters", params: {section: "districts", state: "Kuala Lumpur"}

        expect(response).to have_http_status(:ok)
        expect(response.content_type).to include("application/json")

        json_response = JSON.parse(response.body)
        expect(json_response).to contain_exactly("Bukit Bintang", "KLCC")
      end

      it "returns empty array when state is not provided" do
        get "/api/v1/filters", params: {section: "districts"}

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response).to eq([])
      end

      it "excludes districts from unpublished coffee shops" do
        create(:coffee_shop, state: "Kuala Lumpur", district: "Draft District", status: :unpublished)

        get "/api/v1/filters", params: {section: "districts", state: "Kuala Lumpur"}

        json_response = JSON.parse(response.body)
        expect(json_response).not_to include("Draft District")
      end
    end

    context "when section is tags" do
      let!(:tag1) { create(:tag, slug: "work-friendly", name: "Work Friendly", group: nil, is_public: true, position: 1) }
      let!(:tag2) { create(:tag, slug: "roastery", name: "Roastery", group: nil, is_public: true, position: 2) }
      let!(:tag3) { create(:tag, slug: "private-tag", name: "Private Tag", group: nil, is_public: false, position: 3) }
      let!(:tag4) { create(:tag, slug: "grouped-tag", name: "Grouped Tag", group: "other", is_public: true, position: 4) }

      it "returns public tags with null group sorted by position" do
        get "/api/v1/filters", params: {section: "tags"}

        expect(response).to have_http_status(:ok)
        expect(response.content_type).to include("application/json")
        expect(response).to match_json_schema("filters/tags")

        json_response = JSON.parse(response.body)
        expect(json_response).to eq([
          {"value" => "work-friendly", "label" => "Work Friendly"},
          {"value" => "roastery", "label" => "Roastery"}
        ])
      end

      it "excludes private tags" do
        get "/api/v1/filters", params: {section: "tags"}

        json_response = JSON.parse(response.body)
        expect(json_response.map { |tag| tag["value"] }).not_to include("private-tag")
      end

      it "excludes tags with groups" do
        get "/api/v1/filters", params: {section: "tags"}

        json_response = JSON.parse(response.body)
        expect(json_response.map { |tag| tag["value"] }).not_to include("grouped-tag")
      end

      it "returns tags sorted by position" do
        tag1.update!(position: 10)
        tag2.update!(position: 5)

        get "/api/v1/filters", params: {section: "tags"}

        json_response = JSON.parse(response.body)
        expect(json_response.first["value"]).to eq("roastery")
        expect(json_response.last["value"]).to eq("work-friendly")
      end

      it "returns empty array when no matching tags exist" do
        Tag.update_all(group: "some-group")

        get "/api/v1/filters", params: {section: "tags"}

        json_response = JSON.parse(response.body)
        expect(json_response).to eq([])
      end
    end

    context "when section is invalid" do
      it "returns bad request status" do
        get "/api/v1/filters", params: {section: "invalid"}

        expect(response).to have_http_status(:bad_request)
        json_response = JSON.parse(response.body)
        expect(json_response).to eq([])
      end
    end

    context "when section is not provided" do
      it "returns bad request status" do
        get "/api/v1/filters"

        expect(response).to have_http_status(:bad_request)
        json_response = JSON.parse(response.body)
        expect(json_response).to eq([])
      end
    end
  end
end
