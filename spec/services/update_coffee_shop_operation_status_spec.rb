require "rails_helper"

RSpec.describe UpdateCoffeeShopOperationStatus do
  let(:coffee_shop) { create(:coffee_shop, google_place_id: "test_place_id") }
  let(:service) { described_class.new(coffee_shop: coffee_shop) }

  describe "#sheet_name" do
    around do |example|
      original_zone = Time.zone
      example.run
      Time.zone = original_zone
    end

    context "timezone awareness" do
      it "uses Rails application timezone for date" do
        Time.zone = "Asia/Kuala_Lumpur"

        # Test when it's different dates in different timezones
        # Saturday 2:00 AM in Malaysia = Friday 6:00 PM UTC
        travel_to Time.zone.parse("2024-01-20 02:00:00") do
          # Should use Malaysia date (Saturday), not UTC date (Friday)
          expect(service.send(:sheet_name)).to eq("2024-01-20")
        end
      end

      it "returns consistent date regardless of server timezone" do
        Time.zone = "Asia/Kuala_Lumpur"

        # Test at midnight Malaysia time
        travel_to Time.zone.parse("2024-01-20 00:01:00") do
          expect(service.send(:sheet_name)).to eq("2024-01-20")
        end

        # Test at end of day Malaysia time
        travel_to Time.zone.parse("2024-01-20 23:59:00") do
          expect(service.send(:sheet_name)).to eq("2024-01-20")
        end
      end

      it "handles timezone boundary correctly" do
        Time.zone = "Asia/Kuala_Lumpur"

        # Just before midnight Malaysia time (Friday)
        travel_to Time.zone.parse("2024-01-19 23:59:59") do
          expect(service.send(:sheet_name)).to eq("2024-01-19")
        end

        # Just after midnight Malaysia time (Saturday)
        travel_to Time.zone.parse("2024-01-20 00:00:01") do
          expect(service.send(:sheet_name)).to eq("2024-01-20")
        end
      end
    end

    context "regression test for timezone bug" do
      it "uses Malaysia date even when server is in different timezone" do
        # This tests the exact scenario where the bug would occur
        Time.zone = "Asia/Kuala_Lumpur"

        # Saturday early morning in Malaysia, but still Friday in UTC
        travel_to Time.zone.parse("2024-01-20 01:00:00") do
          # Verify the scenario
          malaysia_date = Time.current.to_date
          utc_date = Time.current.utc.to_date

          expect(malaysia_date.to_s).to eq("2024-01-20") # Saturday
          expect(utc_date.to_s).to eq("2024-01-19") # Friday

          # Should use Malaysia date for sheet name
          expect(service.send(:sheet_name)).to eq("2024-01-20")
        end
      end
    end
  end
end
