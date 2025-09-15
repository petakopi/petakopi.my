require "rails_helper"

RSpec.describe "Api::V1::CoffeeShops - Create", type: :request do
  describe "POST /api/v1/coffee_shops" do
    context "with valid parameters" do
      let(:valid_params) do
        {
          name: "Awesome Coffee Shop",
          tmp_lat: "3.1234",
          tmp_lng: "101.5678",
          instagram: "awesome_coffee",
          facebook: "awesomecoffee",
          twitter: "awesomecoffee",
          tiktok: "awesomecoffee",
          whatsapp: "60123456789"
        }
      end

      it "creates a new coffee shop and returns success response" do
        expect {
          post "/api/v1/coffee_shops", params: valid_params
        }.to change(CoffeeShop, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(response.content_type).to include("application/json")
        expect(response).to match_json_schema("coffee_shops/create_success")

        json_response = JSON.parse(response.body)
        expect(json_response["message"]).to eq("Coffee shop was successfully submitted. Please give us some time to review it.")
        expect(json_response).to have_key("uuid")

        # Verify coffee shop was created
        coffee_shop = CoffeeShop.last
        expect(coffee_shop.name).to eq("Awesome Coffee Shop")
        expect(json_response["uuid"]).to eq(coffee_shop.uuid)
      end

      it "sets the location correctly" do
        post "/api/v1/coffee_shops", params: valid_params

        coffee_shop = CoffeeShop.last
        expect(coffee_shop.location).to be_present
        expect(coffee_shop.location.y).to be_within(0.0001).of(3.1234)
        expect(coffee_shop.location.x).to be_within(0.0001).of(101.5678)
      end

      context "with Google Place ID" do
        let(:valid_params_with_google) do
          valid_params.merge(google_place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4")
        end

        it "creates coffee shop with Google Place ID" do
          post "/api/v1/coffee_shops", params: valid_params_with_google

          expect(response).to have_http_status(:created)
          expect(response).to match_json_schema("coffee_shops/create_success")

          coffee_shop = CoffeeShop.last
          expect(coffee_shop.google_place_id).to eq("ChIJN1t_tDeuEmsRUsoyG83frY4")
        end
      end

      context "with tags" do
        let!(:tag1) { create(:tag, name: "WiFi") }
        let!(:tag2) { create(:tag, name: "Pet Friendly") }
        let(:valid_params_with_tags) do
          valid_params.merge(tag_ids: [tag1.id, tag2.id])
        end

        it "creates coffee shop with associated tags" do
          post "/api/v1/coffee_shops", params: valid_params_with_tags

          expect(response).to have_http_status(:created)
          expect(response).to match_json_schema("coffee_shops/create_success")

          coffee_shop = CoffeeShop.last
          expect(coffee_shop.tags).to include(tag1, tag2)
        end
      end

      context "with minimal parameters" do
        let(:minimal_params) do
          {
            name: "Simple Coffee Shop"
          }
        end

        it "creates coffee shop with only required fields" do
          expect {
            post "/api/v1/coffee_shops", params: minimal_params
          }.to change(CoffeeShop, :count).by(1)

          expect(response).to have_http_status(:created)
          expect(response).to match_json_schema("coffee_shops/create_success")
        end
      end
    end

    context "with invalid parameters" do
      context "when name is missing" do
        let(:invalid_params) do
          {
            tmp_lat: "3.1234",
            tmp_lng: "101.5678"
          }
        end

        it "returns validation error" do
          expect {
            post "/api/v1/coffee_shops", params: invalid_params
          }.not_to change(CoffeeShop, :count)

          expect(response).to have_http_status(:unprocessable_entity)
          expect(response.content_type).to include("application/json")
          expect(response).to match_json_schema("coffee_shops/validation_error")

          json_response = JSON.parse(response.body)
          expect(json_response["errors"]).to have_key("name")
          expect(json_response["errors"]["name"]).to include("can't be blank")
        end
      end

      context "when name is too short" do
        let(:invalid_params) do
          {
            name: "AB"
          }
        end

        it "returns length validation error" do
          post "/api/v1/coffee_shops", params: invalid_params

          expect(response).to have_http_status(:unprocessable_entity)
          expect(response).to match_json_schema("coffee_shops/validation_error")

          json_response = JSON.parse(response.body)
          expect(json_response["errors"]["name"]).to include("is too short (minimum is 3 characters)")
        end
      end

      context "with duplicate Google Place ID" do
        let!(:existing_coffee_shop) do
          create(:coffee_shop, :published, google_place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4")
        end

        let(:duplicate_params) do
          {
            name: "Duplicate Coffee Shop",
            google_place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4"
          }
        end

        it "returns duplicate error with link to existing shop" do
          post "/api/v1/coffee_shops", params: duplicate_params

          expect(response).to have_http_status(:unprocessable_entity)
          expect(response).to match_json_schema("coffee_shops/validation_error")

          json_response = JSON.parse(response.body)
          expect(json_response["errors"]).to have_key("base")
          error_message = json_response["errors"]["base"].first
          expect(error_message).to include("This coffee shop already exists")
          expect(error_message).to include(existing_coffee_shop.name)
        end
      end

      context "with duplicate location" do
        let!(:existing_coffee_shop) do
          create(:coffee_shop, :published, location: "POINT(101.5678 3.1234)")
        end

        let(:duplicate_params) do
          {
            name: "Duplicate Location Shop",
            tmp_lat: "3.1234",
            tmp_lng: "101.5678"
          }
        end

        it "returns duplicate error for same location" do
          post "/api/v1/coffee_shops", params: duplicate_params

          expect(response).to have_http_status(:unprocessable_entity)
          expect(response).to match_json_schema("coffee_shops/validation_error")

          json_response = JSON.parse(response.body)
          expect(json_response["errors"]).to have_key("base")
          error_message = json_response["errors"]["base"].first
          expect(error_message).to include("This coffee shop already exists")
        end
      end

      context "with location slightly different (more than 10 meters)" do
        let!(:existing_coffee_shop) do
          create(:coffee_shop, :published, location: "POINT(101.5678 3.1234)")
        end

        let(:different_location_params) do
          {
            name: "Different Location Shop",
            tmp_lat: "3.1240",
            tmp_lng: "101.5685"
          }
        end

        it "creates coffee shop successfully" do
          expect {
            post "/api/v1/coffee_shops", params: different_location_params
          }.to change(CoffeeShop, :count).by(1)

          expect(response).to have_http_status(:created)
          expect(response).to match_json_schema("coffee_shops/create_success")
        end
      end

      context "with invalid coordinate format" do
        let(:invalid_params) do
          {
            name: "Test Coffee Shop",
            tmp_lat: "invalid",
            tmp_lng: "also_invalid"
          }
        end

        it "creates shop but without location" do
          post "/api/v1/coffee_shops", params: invalid_params

          expect(response).to have_http_status(:created)
          coffee_shop = CoffeeShop.last
          expect(coffee_shop.location).to be_nil
        end
      end

      context "with multiple validation errors" do
        let(:invalid_params) do
          {
            name: ""
          }
        end

        it "returns all validation errors" do
          post "/api/v1/coffee_shops", params: invalid_params

          expect(response).to have_http_status(:unprocessable_entity)
          expect(response).to match_json_schema("coffee_shops/validation_error")

          json_response = JSON.parse(response.body)
          expect(json_response["errors"]["name"]).to include("can't be blank")
        end
      end
    end

    context "edge cases" do
      context "with very long valid name" do
        let(:valid_params) do
          {
            name: "A" * 100
          }
        end

        it "creates coffee shop successfully" do
          expect {
            post "/api/v1/coffee_shops", params: valid_params
          }.to change(CoffeeShop, :count).by(1)

          expect(response).to have_http_status(:created)
        end
      end

      context "with special characters in name" do
        let(:valid_params) do
          {
            name: "Café & Co. - The #1 Coffee Shop!"
          }
        end

        it "creates coffee shop successfully" do
          expect {
            post "/api/v1/coffee_shops", params: valid_params
          }.to change(CoffeeShop, :count).by(1)

          expect(response).to have_http_status(:created)
          coffee_shop = CoffeeShop.last
          expect(coffee_shop.name).to eq("Café & Co. - The #1 Coffee Shop!")
        end
      end
    end
  end
end
