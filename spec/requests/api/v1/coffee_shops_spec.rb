require "rails_helper"

RSpec.describe "API::V1::CoffeeShops", type: :request do
  let!(:coffee_shop1) do
    create(
      :coffee_shop,
      name: "KLCC Coffee",
      location: "POINT(101.7117 3.1578)", # KLCC location
      state: "Kuala Lumpur",
      district: "KLCC",
      status: :published
    )
  end
  let!(:coffee_shop2) do
    create(
      :coffee_shop,
      name: "Bukit Bintang Coffee",
      location: "POINT(101.7117 3.1478)", # ~1.1km from KLCC
      state: "Kuala Lumpur",
      district: "Bukit Bintang",
      status: :published
    )
  end
  let!(:coffee_shop3) do
    create(
      :coffee_shop,
      name: "Klang Coffee",
      location: "POINT(101.4500 3.0333)", # ~25km from KLCC
      state: "Selangor",
      district: "Klang",
      status: :published
    )
  end

  describe "GET /api/v1/coffee_shops" do
    context "when requesting coffee shops with distance filter" do
      it "includes distance_in_km in the response" do
        get "/api/v1/coffee_shops", params: {
          lat: 3.1578,
          lng: 101.7117,
          distance: 2
        }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        expect(json_response["data"]["coffee_shops"]).to be_present
        expect(json_response["data"]["coffee_shops"].size).to eq(2) # coffee_shop1 and coffee_shop2

        # Check that distance_in_km is present and valid
        json_response["data"]["coffee_shops"].each do |coffee_shop|
          expect(coffee_shop["distance_in_km"]).to be_present
          expect(coffee_shop["distance_in_km"]).to be_a(Float)
          expect(coffee_shop["distance_in_km"]).to be >= 0
        end

        # Verify shops are ordered by distance
        distances = json_response["data"]["coffee_shops"].map { |cs| cs["distance_in_km"] }
        expect(distances).to eq(distances.sort)
      end

      it "handles the problematic query with tags and opening hours without errors" do
        tag = create(:tag, slug: "pour-over")
        coffee_shop1.tags << tag

        # Create opening hours for Monday 9 AM - 5 PM
        create(:opening_hour, :same_day, coffee_shop: coffee_shop1)

        # Monday at 10:00 AM
        travel_to Time.zone.local(2025, 4, 14, 10, 0, 0) do
          get "/api/v1/coffee_shops", params: {
            "tags[]": "pour-over",
            opened: "true",
            distance: 20,
            lat: 3.1578,
            lng: 101.7117
          }

          expect(response).to have_http_status(:ok)
          json_response = JSON.parse(response.body)

          expect(json_response["data"]["coffee_shops"]).to be_present
          expect(json_response["data"]["coffee_shops"].size).to eq(1)

          coffee_shop = json_response["data"]["coffee_shops"].first
          expect(coffee_shop["name"]).to eq("KLCC Coffee")
          expect(coffee_shop["distance_in_km"]).to be_present
          expect(coffee_shop["distance_in_km"]).to be_a(Float)
        end
      end
    end

    context "when requesting coffee shops without distance filter" do
      it "includes distance_in_km as null" do
        get "/api/v1/coffee_shops"

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        expect(json_response["data"]["coffee_shops"]).to be_present

        # Check that distance_in_km is present but null
        json_response["data"]["coffee_shops"].each do |coffee_shop|
          expect(coffee_shop).to have_key("distance_in_km")
          expect(coffee_shop["distance_in_km"]).to be_nil
        end
      end
    end

    context "when requesting opening hours information" do
      before do
        # Create opening hours for different scenarios
        create(:opening_hour, :same_day, coffee_shop: coffee_shop1) # Monday 9 AM - 5 PM
        create(:opening_hour, :overnight, coffee_shop: coffee_shop2) # Monday 6 PM - Tuesday 2 AM
        create(:opening_hour, :weekend, coffee_shop: coffee_shop3) # Saturday-Sunday 10 AM - 10 PM
      end

      it "includes business_hours in the response" do
        get "/api/v1/coffee_shops"

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        expect(json_response["data"]["coffee_shops"]).to be_present

        json_response["data"]["coffee_shops"].each do |coffee_shop|
          expect(coffee_shop).to have_key("business_hours")
          expect(coffee_shop["business_hours"]).to be_present
          expect(coffee_shop["business_hours"]).to be_a(Hash)
          expect(coffee_shop["business_hours"]).to have_key("periods")
          expect(coffee_shop["business_hours"]["periods"]).to be_an(Array)

          # Each period entry should have the expected structure
          coffee_shop["business_hours"]["periods"].each do |period|
            expect(period).to have_key("open")
            expect(period).to have_key("close")
            expect(period["open"]).to have_key("day")
            expect(period["open"]).to have_key("time")
            expect(period["close"]).to have_key("day")
            expect(period["close"]).to have_key("time")
          end
        end
      end

      it "returns properly formatted opening hours for same day schedule" do
        get "/api/v1/coffee_shops", params: {
          keyword: "KLCC"
        }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        coffee_shop = json_response["data"]["coffee_shops"].first
        expect(coffee_shop["name"]).to eq("KLCC Coffee")
        expect(coffee_shop["business_hours"]).to be_present
        expect(coffee_shop["business_hours"]["periods"]).to be_present

        # Should have Monday entry
        monday_period = coffee_shop["business_hours"]["periods"].find { |period| period["open"]["day"] == "MONDAY" }
        expect(monday_period).to be_present
        expect(monday_period["open"]["time"]).to eq("09:00")
        expect(monday_period["close"]["time"]).to eq("17:00")
      end

      it "returns properly formatted opening hours for overnight schedule" do
        get "/api/v1/coffee_shops", params: {
          keyword: "Bukit Bintang"
        }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        coffee_shop = json_response["data"]["coffee_shops"].first
        expect(coffee_shop["name"]).to eq("Bukit Bintang Coffee")
        expect(coffee_shop["business_hours"]).to be_present
        expect(coffee_shop["business_hours"]["periods"]).to be_present

        # Should have entries for overnight hours
        periods = coffee_shop["business_hours"]["periods"]
        expect(periods.length).to be >= 1
      end
    end

    context "when combining multiple filters" do
      let!(:tag) { create(:tag, slug: "wifi") }

      before do
        coffee_shop1.tags << tag
        coffee_shop2.tags << tag
        create(:opening_hour, :same_day, coffee_shop: coffee_shop1)
        create(:opening_hour, :same_day, coffee_shop: coffee_shop2)
      end

      it "returns coffee shops with all required fields when combining distance, tags, and opening hours" do
        travel_to Time.zone.local(2025, 4, 14, 10, 0, 0) do
          get "/api/v1/coffee_shops", params: {
            "tags[]": "wifi",
            opened: "true",
            distance: 5,
            lat: 3.1578,
            lng: 101.7117
          }

          expect(response).to have_http_status(:ok)
          json_response = JSON.parse(response.body)

          expect(json_response["data"]["coffee_shops"]).to be_present
          expect(json_response["data"]["coffee_shops"].size).to eq(2)

          json_response["data"]["coffee_shops"].each do |coffee_shop|
            # Verify all key fields are present
            expect(coffee_shop).to have_key("uuid")
            expect(coffee_shop).to have_key("name")
            expect(coffee_shop).to have_key("distance_in_km")
            expect(coffee_shop).to have_key("business_hours")
            expect(coffee_shop).to have_key("tags")

            # Verify distance is calculated
            expect(coffee_shop["distance_in_km"]).to be_present
            expect(coffee_shop["distance_in_km"]).to be_a(Float)

            # Verify business hours are present
            expect(coffee_shop["business_hours"]).to be_present
            expect(coffee_shop["business_hours"]).to be_a(Hash)
            expect(coffee_shop["business_hours"]["periods"]).to be_an(Array)

            # Verify tags are present
            expect(coffee_shop["tags"]).to be_present
            expect(coffee_shop["tags"]).to be_an(Array)
            expect(coffee_shop["tags"].any? { |tag| tag["slug"] == "wifi" }).to be true
          end
        end
      end
    end

    context "when filtering by state and district" do
      let!(:selangor_petaling_shop) do
        create(
          :coffee_shop,
          name: "Selangor Petaling Coffee",
          state: "Selangor",
          district: "Petaling",
          status: :published
        )
      end
      let!(:selangor_klang_shop) do
        create(
          :coffee_shop,
          name: "Selangor Klang Coffee",
          state: "Selangor",
          district: "Klang",
          status: :published
        )
      end
      let!(:kl_bukit_bintang_shop) do
        create(
          :coffee_shop,
          name: "KL Bukit Bintang Coffee",
          state: "Kuala Lumpur",
          district: "Bukit Bintang",
          status: :published
        )
      end

      it "filters by state only" do
        get "/api/v1/coffee_shops", params: {
          state: "Selangor"
        }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        expect(json_response["data"]["coffee_shops"]).to be_present
        coffee_shop_names = json_response["data"]["coffee_shops"].map { |cs| cs["name"] }

        expect(coffee_shop_names).to include("Selangor Petaling Coffee", "Selangor Klang Coffee")
        expect(coffee_shop_names).not_to include("KL Bukit Bintang Coffee")
      end

      it "filters by state and district" do
        get "/api/v1/coffee_shops", params: {
          state: "Selangor",
          district: "Petaling"
        }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        expect(json_response["data"]["coffee_shops"]).to be_present
        expect(json_response["data"]["coffee_shops"].size).to eq(1)

        coffee_shop = json_response["data"]["coffee_shops"].first
        expect(coffee_shop["name"]).to eq("Selangor Petaling Coffee")
        expect(coffee_shop["state"]).to eq("Selangor")
        expect(coffee_shop["district"]).to eq("Petaling")
      end

      it "returns empty result when no shops match the state/district filter" do
        get "/api/v1/coffee_shops", params: {
          state: "Penang",
          district: "Georgetown"
        }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        expect(json_response["data"]["coffee_shops"]).to be_empty
      end

      it "is case sensitive in state filtering" do
        get "/api/v1/coffee_shops", params: {
          state: "selangor"  # lowercase
        }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        coffee_shop_names = json_response["data"]["coffee_shops"].map { |cs| cs["name"] }

        # Should not find shops with different case (case-sensitive)
        expect(coffee_shop_names).not_to include("Selangor Petaling Coffee", "Selangor Klang Coffee")
        expect(json_response["data"]["coffee_shops"]).to be_empty
      end

      it "is case sensitive in district filtering" do
        get "/api/v1/coffee_shops", params: {
          state: "Selangor",
          district: "petaling"  # lowercase
        }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        coffee_shop_names = json_response["data"]["coffee_shops"].map { |cs| cs["name"] }

        # Should not find the shop with different case (case-sensitive)
        expect(coffee_shop_names).not_to include("Selangor Petaling Coffee")
        expect(json_response["data"]["coffee_shops"]).to be_empty
      end

      it "works with other filters combined" do
        # Add tags to test combination with location filters
        tag = create(:tag, slug: "specialty")
        selangor_petaling_shop.tags << tag

        get "/api/v1/coffee_shops", params: {
          state: "Selangor",
          district: "Petaling",
          "tags[]": "specialty"
        }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        expect(json_response["data"]["coffee_shops"]).to be_present
        expect(json_response["data"]["coffee_shops"].size).to eq(1)

        coffee_shop = json_response["data"]["coffee_shops"].first
        expect(coffee_shop["name"]).to eq("Selangor Petaling Coffee")
        expect(coffee_shop["tags"]).to be_present
        expect(coffee_shop["tags"].any? { |tag| tag["slug"] == "specialty" }).to be true
      end

      it "maintains proper pagination structure" do
        get "/api/v1/coffee_shops", params: {
          state: "Selangor"
        }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        expect(json_response["status"]).to eq("success")
        expect(json_response["data"]).to have_key("pages")
        expect(json_response["data"]["pages"]).to have_key("current_page")
        expect(json_response["data"]["pages"]).to have_key("total_pages")
        expect(json_response["data"]["pages"]).to have_key("total_count")
        expect(json_response["data"]["pages"]).to have_key("is_empty")
      end
    end

    context "when handling invalid distance parameters" do
      it "handles distance=undefined without errors" do
        get "/api/v1/coffee_shops", params: {
          state: "Johor",
          distance: "undefined",
          lat: 6.94637872561493,
          lng: 100.41243480740246
        }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        expect(json_response["data"]["coffee_shops"]).to be_an(Array)
        # Should not try to order by distance_in_km since distance is invalid
        # Should fall back to state-based ordering (district, name)
      end

      it "handles missing distance parameter when lat/lng are present" do
        get "/api/v1/coffee_shops", params: {
          state: "Selangor",
          lat: 3.1578,
          lng: 101.7117
        }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        expect(json_response["data"]["coffee_shops"]).to be_an(Array)
        # Should not try to order by distance_in_km since distance is missing
      end

      it "handles invalid distance values" do
        get "/api/v1/coffee_shops", params: {
          state: "Selangor",
          distance: "invalid",
          lat: 3.1578,
          lng: 101.7117
        }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        expect(json_response["data"]["coffee_shops"]).to be_an(Array)
        # Should not try to order by distance_in_km since distance is invalid
      end

      it "handles zero distance" do
        get "/api/v1/coffee_shops", params: {
          state: "Selangor",
          distance: "0",
          lat: 3.1578,
          lng: 101.7117
        }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        expect(json_response["data"]["coffee_shops"]).to be_an(Array)
        # Should not try to order by distance_in_km since distance is 0 (invalid)
      end

      it "handles negative distance" do
        get "/api/v1/coffee_shops", params: {
          state: "Selangor",
          distance: "-5",
          lat: 3.1578,
          lng: 101.7117
        }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        expect(json_response["data"]["coffee_shops"]).to be_an(Array)
        # Should not try to order by distance_in_km since distance is negative (invalid)
      end
    end
  end
end
