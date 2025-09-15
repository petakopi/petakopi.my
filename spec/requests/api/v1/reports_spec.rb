require "rails_helper"

RSpec.describe "Api::V1::Reports", type: :request do
  let!(:coffee_shop) { create(:coffee_shop, :published) }

  describe "POST /api/v1/reports" do
    context "with valid parameters" do
      let(:valid_params) do
        {
          coffee_shop_id: coffee_shop.uuid,
          message: "The opening hours are incorrect and need updating",
          email: "user@example.com"
        }
      end

      it "creates a report and returns success response" do
        expect {
          post "/api/v1/reports", params: valid_params
        }.to change(TelegramNotifierWorker.jobs, :size).by(1)

        expect(response).to have_http_status(:created)
        expect(response.content_type).to include("application/json")
        expect(response).to match_json_schema("reports/create_success")

        json_response = JSON.parse(response.body)
        expect(json_response).to eq({
          "message" => "Thank you for your report. We will review it shortly."
        })
      end

      it "sends the correct message to TelegramNotifierWorker" do
        travel_to Time.zone.parse("2024-01-01 12:00:00") do
          post "/api/v1/reports", params: valid_params

          message_content = TelegramNotifierWorker.jobs.last["args"].first
          expect(message_content).to include(
            "Coffee Shop ID: #{coffee_shop.id}",
            "Coffee Shop Name: #{coffee_shop.name}",
            "Coffee Shop UUID: #{coffee_shop.uuid}",
            "Email: user@example.com",
            "Report: The opening hours are incorrect and need updating",
            "Source: Mobile App"
          )
          expect(message_content).to match(/Submitted at: 2024-01-01 12:00:00/)
        end
      end

      context "with coffee_shop_id as slug" do
        let(:valid_params) do
          {
            coffee_shop_id: coffee_shop.slug,
            message: "The location is wrong and needs correction"
          }
        end

        it "finds coffee shop by slug and creates report" do
          post "/api/v1/reports", params: valid_params

          expect(response).to have_http_status(:created)
          expect(response).to match_json_schema("reports/create_success")
          json_response = JSON.parse(response.body)
          expect(json_response).to have_key("message")
        end
      end

      context "with coffee_shop_id as integer ID" do
        let(:valid_params) do
          {
            coffee_shop_id: coffee_shop.id,
            message: "The phone number is wrong and needs updating"
          }
        end

        it "finds coffee shop by ID and creates report" do
          post "/api/v1/reports", params: valid_params

          expect(response).to have_http_status(:created)
          expect(response).to match_json_schema("reports/create_success")
          json_response = JSON.parse(response.body)
          expect(json_response).to have_key("message")
        end
      end

      context "without email" do
        let(:valid_params) do
          {
            coffee_shop_id: coffee_shop.uuid,
            message: "The opening hours are incorrect and need updating"
          }
        end

        it "creates report with N/A for email" do
          post "/api/v1/reports", params: valid_params

          expect(response).to have_http_status(:created)
          expect(response).to match_json_schema("reports/create_success")
          expect(TelegramNotifierWorker.jobs.last["args"].first).to include("Email: N/A")
        end
      end
    end

    context "with invalid parameters" do
      context "when message is blank" do
        let(:invalid_params) do
          {
            coffee_shop_id: coffee_shop.uuid,
            message: "",
            email: "user@example.com"
          }
        end

        it "returns validation error" do
          post "/api/v1/reports", params: invalid_params

          expect(response).to have_http_status(:unprocessable_entity)
          expect(response.content_type).to include("application/json")
          expect(response).to match_json_schema("reports/validation_error")

          json_response = JSON.parse(response.body)
          expect(json_response["errors"]).to have_key("message")
          expect(json_response["errors"]["message"]).to include("can't be blank")
        end

        it "does not enqueue TelegramNotifierWorker job" do
          expect {
            post "/api/v1/reports", params: invalid_params
          }.not_to change(TelegramNotifierWorker.jobs, :size)
        end
      end

      context "when message is too short" do
        let(:invalid_params) do
          {
            coffee_shop_id: coffee_shop.uuid,
            message: "short",
            email: "user@example.com"
          }
        end

        it "returns length validation error" do
          post "/api/v1/reports", params: invalid_params

          expect(response).to have_http_status(:unprocessable_entity)
          expect(response).to match_json_schema("reports/validation_error")
          json_response = JSON.parse(response.body)
          expect(json_response["errors"]["message"]).to include("is too short (minimum is 10 characters)")
        end
      end

      context "when message is too long" do
        let(:invalid_params) do
          {
            coffee_shop_id: coffee_shop.uuid,
            message: "x" * 1001,
            email: "user@example.com"
          }
        end

        it "returns length validation error" do
          post "/api/v1/reports", params: invalid_params

          expect(response).to have_http_status(:unprocessable_entity)
          expect(response).to match_json_schema("reports/validation_error")
          json_response = JSON.parse(response.body)
          expect(json_response["errors"]["message"]).to include("is too long (maximum is 1000 characters)")
        end
      end

      context "when email format is invalid" do
        let(:invalid_params) do
          {
            coffee_shop_id: coffee_shop.uuid,
            message: "This is a valid message with enough length",
            email: "invalid-email"
          }
        end

        it "returns email format validation error" do
          post "/api/v1/reports", params: invalid_params

          expect(response).to have_http_status(:unprocessable_entity)
          expect(response).to match_json_schema("reports/validation_error")
          json_response = JSON.parse(response.body)
          expect(json_response["errors"]["email"]).to include("is invalid")
        end
      end

      context "when coffee_shop_id is missing" do
        let(:invalid_params) do
          {
            message: "This is a valid message with enough length",
            email: "user@example.com"
          }
        end

        it "returns validation error" do
          post "/api/v1/reports", params: invalid_params

          expect(response).to have_http_status(:unprocessable_entity)
          expect(response).to match_json_schema("reports/validation_error")
          json_response = JSON.parse(response.body)
          expect(json_response["errors"]["coffee_shop_id"]).to include("can't be blank")
        end
      end

      context "when coffee shop is closed" do
        let!(:closed_coffee_shop) { create(:coffee_shop, :closed) }
        let(:invalid_params) do
          {
            coffee_shop_id: closed_coffee_shop.uuid,
            message: "This is a valid message with enough length",
            email: "user@example.com"
          }
        end

        it "returns base validation error" do
          post "/api/v1/reports", params: invalid_params

          expect(response).to have_http_status(:unprocessable_entity)
          expect(response).to match_json_schema("reports/validation_error")
          json_response = JSON.parse(response.body)
          expect(json_response["errors"]["base"]).to include("Cannot report on closed coffee shops")
        end
      end

      context "with multiple validation errors" do
        let(:invalid_params) do
          {
            coffee_shop_id: "",
            message: "short",
            email: "invalid-email"
          }
        end

        it "returns all validation errors" do
          post "/api/v1/reports", params: invalid_params

          expect(response).to have_http_status(:unprocessable_entity)
          expect(response).to match_json_schema("reports/validation_error")
          json_response = JSON.parse(response.body)

          expect(json_response["errors"]).to include(
            "coffee_shop_id" => include("can't be blank"),
            "message" => include("is too short (minimum is 10 characters)"),
            "email" => include("is invalid")
          )
        end
      end
    end

    context "when coffee shop is not found" do
      let(:invalid_params) do
        {
          coffee_shop_id: "nonexistent-uuid",
          message: "This message is long enough for validation requirements"
        }
      end

      it "returns not found error" do
        post "/api/v1/reports", params: invalid_params

        expect(response).to have_http_status(:not_found)
        expect(response.content_type).to include("application/json")
        expect(response).to match_json_schema("reports/validation_error")

        json_response = JSON.parse(response.body)
        expect(json_response).to eq({
          "errors" => {
            "coffee_shop_id" => ["not found"]
          }
        })
      end

      it "does not enqueue TelegramNotifierWorker job" do
        expect {
          post "/api/v1/reports", params: invalid_params
        }.not_to change(TelegramNotifierWorker.jobs, :size)
      end
    end
  end
end
