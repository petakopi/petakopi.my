require "rails_helper"

RSpec.describe CoffeeShopsListQuery do
  describe "#call" do
    let!(:coffee_shop1) { create(:coffee_shop, name: "Awesome Coffee", state: "Selangor", district: "Petaling") }
    let!(:coffee_shop2) { create(:coffee_shop, name: "Best Coffee", state: "Kuala Lumpur", district: "Bukit Bintang") }
    let!(:coffee_shop3) { create(:coffee_shop, name: "Cool Coffee", state: "Selangor", district: "Klang") }
    let!(:unpublished_shop) { create(:coffee_shop, name: "Hidden Coffee", status: :unpublished) }

    describe "filter_by_locations" do
      it "returns all coffee shops when no location filters are applied" do
        result = described_class.call(params: {}).status_published

        expect(result).to include(coffee_shop1, coffee_shop2, coffee_shop3)
        expect(result).not_to include(unpublished_shop)
      end

      it "filters by state only" do
        result = described_class.call(params: { state: "Selangor" }).status_published

        expect(result).to include(coffee_shop1, coffee_shop3)
        expect(result).not_to include(coffee_shop2, unpublished_shop)
      end

      it "filters by state and district" do
        result = described_class.call(params: { state: "Selangor", district: "Petaling" }).status_published

        expect(result).to include(coffee_shop1)
        expect(result).not_to include(coffee_shop2, coffee_shop3, unpublished_shop)
      end
    end

    describe "filter_by_keyword" do
      it "filters by name" do
        result = described_class.call(params: { keyword: "Best" }).status_published

        expect(result).to include(coffee_shop2)
        expect(result).not_to include(coffee_shop1, coffee_shop3, unpublished_shop)
      end

      it "is case insensitive" do
        result = described_class.call(params: { keyword: "best" }).status_published

        expect(result).to include(coffee_shop2)
        expect(result).not_to include(coffee_shop1, coffee_shop3, unpublished_shop)
      end

      it "works with partial matches" do
        result = described_class.call(params: { keyword: "Coffee" }).status_published

        expect(result).to include(coffee_shop1, coffee_shop2, coffee_shop3)
        expect(result).not_to include(unpublished_shop)
      end
    end

    describe "filter_by_tags" do
      let!(:tag1) { create(:tag, slug: "work-friendly") }
      let!(:tag2) { create(:tag, slug: "halal-certified") }

      before do
        coffee_shop1.tags << tag1
        coffee_shop2.tags << tag2
        coffee_shop3.tags << [tag1, tag2]
      end

      it "filters by a single tag" do
        result = described_class.call(params: { tags: "work-friendly" }).status_published

        expect(result).to include(coffee_shop1, coffee_shop3)
        expect(result).not_to include(coffee_shop2, unpublished_shop)
      end

      it "filters by multiple tags" do
        result = described_class.call(params: { tags: "work-friendly,halal-certified" }).status_published

        # This returns shops that have ANY of the tags, not ALL of them
        expect(result).to include(coffee_shop1, coffee_shop2, coffee_shop3)
        expect(result).not_to include(unpublished_shop)
      end
    end

    describe "filter_by_opening_status" do
      context "when current time is within regular opening hours" do
        before do
          # Monday at 10:00 AM
          travel_to Time.zone.local(2025, 4, 14, 10, 0, 0)

          # Create opening hours for each shop
          create(:opening_hour, :same_day, coffee_shop: coffee_shop1)
          create(:opening_hour, :sunday_overnight, coffee_shop: coffee_shop2)
          create(:opening_hour, :weekend, coffee_shop: coffee_shop3)
        end

        after { travel_back }

        it "returns shops that are currently open" do
          result = described_class.call(params: { opened: "true" }).status_published

          expect(result).to include(coffee_shop1)
          expect(result).to include(coffee_shop2) # Overnight from Sunday to Monday
          expect(result).not_to include(coffee_shop3) # Only open on weekends
          expect(result).not_to include(unpublished_shop)
        end

        it "returns all shops when opened filter is not applied" do
          result = described_class.call(params: {}).status_published

          expect(result).to include(coffee_shop1, coffee_shop2, coffee_shop3)
          expect(result).not_to include(unpublished_shop)
        end
      end

      context "when current time is outside regular opening hours" do
        before do
          # Monday at 6:00 PM (after regular hours)
          travel_to Time.zone.local(2025, 4, 14, 18, 0, 0)

          # Create opening hours for each shop
          create(:opening_hour, :same_day, coffee_shop: coffee_shop1)
          create(:opening_hour, :overnight, coffee_shop: coffee_shop2)
          create(:opening_hour, :weekend, coffee_shop: coffee_shop3)
        end

        after { travel_back }

        it "returns only shops that are open at this hour" do
          result = described_class.call(params: { opened: "true" }).status_published

          expect(result).not_to include(coffee_shop1) # Closed at 5:00 PM
          expect(result).to include(coffee_shop2) # Open overnight
          expect(result).not_to include(coffee_shop3) # Only open on weekends
          expect(result).not_to include(unpublished_shop)
        end
      end

      context "when current time is on a weekend" do
        before do
          # Saturday at 12:00 PM
          travel_to Time.zone.local(2025, 4, 12, 12, 0, 0)

          # Create opening hours for each shop
          create(:opening_hour, :same_day, coffee_shop: coffee_shop1)
          create(:opening_hour, :overnight, coffee_shop: coffee_shop2)
          create(:opening_hour, :weekend, coffee_shop: coffee_shop3)
        end

        after { travel_back }

        it "returns shops that are open on weekends" do
          result = described_class.call(params: { opened: "true" }).status_published

          expect(result).not_to include(coffee_shop1) # Only open on weekdays
          expect(result).not_to include(coffee_shop2) # Only open on weekdays
          expect(result).to include(coffee_shop3) # Open on weekends
          expect(result).not_to include(unpublished_shop)
        end
      end

      context "when a shop has multiple opening hours" do
        before do
          # Monday at 10:00 AM
          travel_to Time.zone.local(2025, 4, 14, 10, 0, 0)

          # Create multiple opening hours for one shop
          create(:opening_hour, :same_day, coffee_shop: coffee_shop1)
          create(:opening_hour, :weekend, coffee_shop: coffee_shop1)
        end

        after { travel_back }

        it "returns the shop if any of its opening hours match the current time" do
          result = described_class.call(params: { opened: "true" }).status_published

          expect(result).to include(coffee_shop1)
        end
      end
    end

    describe "combining filters" do
      let!(:tag1) { create(:tag, slug: "work-friendly") }

      before do
        coffee_shop1.tags << tag1

        # Monday at 10:00 AM
        travel_to Time.zone.local(2025, 4, 14, 10, 0, 0)

        # Create opening hours
        create(:opening_hour, :same_day, coffee_shop: coffee_shop1)
        create(:opening_hour, :overnight, coffee_shop: coffee_shop2)
        create(:opening_hour, :weekend, coffee_shop: coffee_shop3)
      end

      after { travel_back }

      it "combines location, tag, and opening hour filters" do
        result = described_class.call(params: {
          state: "Selangor",
          tags: "work-friendly",
          opened: "true"
        }).status_published

        expect(result).to include(coffee_shop1)
        expect(result).not_to include(coffee_shop2, coffee_shop3, unpublished_shop)
      end

      it "combines keyword and opening hour filters" do
        result = described_class.call(params: {
          keyword: "Awesome",
          opened: "true"
        }).status_published

        expect(result).to include(coffee_shop1)
        expect(result).not_to include(coffee_shop2, coffee_shop3, unpublished_shop)
      end
    end
  end
end
