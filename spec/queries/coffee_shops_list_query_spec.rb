require "rails_helper"

RSpec.describe CoffeeShopsListQuery do
  let!(:coffee_shop1) do
    create(
      :coffee_shop,
      name: "Awesome Coffee",
      state: "Selangor",
      district: "Petaling"
    )
  end
  let!(:coffee_shop2) do
    create(
      :coffee_shop,
      name: "Best Coffee",
      state: "Kuala Lumpur",
      district: "Bukit Bintang"
    )
  end
  let!(:coffee_shop3) do
    create(
      :coffee_shop,
      name: "Cool Coffee",
      state: "Selangor",
      district: "Klang"
    )
  end
  let!(:unpublished_shop) do
    create(
      :coffee_shop,
      name: "Hidden Coffee",
      status: :unpublished
    )
  end

  describe "#call" do
    describe "filter_by_locations" do
      it "returns all coffee shops when no location filters are applied" do
        result = described_class.call(params: {}).status_published

        expect(result).to include(coffee_shop1, coffee_shop2, coffee_shop3)
        expect(result).not_to include(unpublished_shop)
      end

      it "filters by state only" do
        result = described_class.call(params: {state: "Selangor"}).status_published

        expect(result).to include(coffee_shop1, coffee_shop3)
        expect(result).not_to include(coffee_shop2, unpublished_shop)
      end

      it "filters by state and district" do
        result = described_class.call(params: {state: "Selangor", district: "Petaling"}).status_published

        expect(result).to include(coffee_shop1)
        expect(result).not_to include(coffee_shop2, coffee_shop3, unpublished_shop)
      end
    end

    describe "filter_by_keyword" do
      it "filters by name" do
        result = described_class.call(params: {keyword: "Best"}).status_published

        expect(result).to include(coffee_shop2)
        expect(result).not_to include(coffee_shop1, coffee_shop3, unpublished_shop)
      end

      it "is case insensitive" do
        result = described_class.call(params: {keyword: "best"}).status_published

        expect(result).to include(coffee_shop2)
        expect(result).not_to include(coffee_shop1, coffee_shop3, unpublished_shop)
      end

      it "works with partial matches" do
        result = described_class.call(params: {keyword: "Coffee"}).status_published

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
        result = described_class.call(params: {tags: "work-friendly"}).status_published

        expect(result).to include(coffee_shop1, coffee_shop3)
        expect(result).not_to include(coffee_shop2, unpublished_shop)
      end

      it "filters by multiple tags" do
        result = described_class.call(params: {tags: "work-friendly,halal-certified"}).status_published

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
          result = described_class.call(params: {opened: "true"}).status_published

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
          result = described_class.call(params: {opened: "true"}).status_published

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
          result = described_class.call(params: {opened: "true"}).status_published

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
          result = described_class.call(params: {opened: "true"}).status_published

          expect(result).to include(coffee_shop1)
        end
      end
    end

    describe "filter_by_distance" do
      before do
        # Set up locations for coffee shops
        # coffee_shop1: Near KLCC (3.1578, 101.7117)
        # coffee_shop2: Near Bukit Bintang (3.1478, 101.7117)
        # coffee_shop3: Near Klang (3.0333, 101.4500)
        coffee_shop1.update(location: "POINT(101.7117 3.1578)")
        coffee_shop2.update(location: "POINT(101.7117 3.1478)")
        coffee_shop3.update(location: "POINT(101.4500 3.0333)")
      end

      it "returns all coffee shops when no distance filters are applied" do
        result = described_class.call(params: {}).status_published

        expect(result).to include(coffee_shop1, coffee_shop2, coffee_shop3)
        expect(result).not_to include(unpublished_shop)
      end

      it "filters coffee shops within specified distance" do
        # Search from KLCC (3.1578, 101.7117) with 2km radius
        result = described_class.call(params: {
          lat: 3.1578,
          lng: 101.7117,
          distance: 2
        }).status_published

        expect(result).to include(coffee_shop1, coffee_shop2) # Both within 2km of KLCC
        expect(result).not_to include(coffee_shop3) # Too far from KLCC
        expect(result).not_to include(unpublished_shop)
      end

      it "orders results by distance when distance filter is applied" do
        result = described_class.call(params: {
          lat: 3.1578,
          lng: 101.7117,
          distance: 50 # Increased radius to include Klang
        }).status_published

        # Should be ordered by distance from KLCC
        # coffee_shop1 is at KLCC (0km)
        # coffee_shop2 is near Bukit Bintang (~1.1km)
        # coffee_shop3 is in Klang (~25km)
        expect(result.to_a).to eq([coffee_shop1, coffee_shop2, coffee_shop3])
      end

      it "includes distance in the result when distance filter is applied" do
        result = described_class.call(params: {
          lat: 3.1578,
          lng: 101.7117,
          distance: 5
        }).status_published

        expect(result.first.distance_in_km).to be_present
        expect(result.first.distance_in_km).to be_a(Float)
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

        # Set up locations
        coffee_shop1.update(location: "POINT(101.7117 3.1578)")
        coffee_shop2.update(location: "POINT(101.7117 3.1478)")
        coffee_shop3.update(location: "POINT(101.4500 3.0333)")
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

      it "combines distance, tag, and opening hour filters" do
        result = described_class.call(params: {
          lat: 3.1578,
          lng: 101.7117,
          distance: 2,
          tags: "work-friendly",
          opened: "true"
        }).status_published

        expect(result).to include(coffee_shop1)
        expect(result).not_to include(coffee_shop2, coffee_shop3, unpublished_shop)
      end

      it "combines distance and keyword filters" do
        result = described_class.call(params: {
          lat: 3.1578,
          lng: 101.7117,
          distance: 2,
          keyword: "Awesome"
        }).status_published

        expect(result).to include(coffee_shop1)
        expect(result).not_to include(coffee_shop2, coffee_shop3, unpublished_shop)
      end

      it "handles the problematic query with tags, distance, and opening hours without errors" do
        # This test case reproduces the issue where combining tags + distance caused
        # "column distance_in_km does not exist" error due to pagination DISTINCT operations
        result = described_class.call(params: {
          tags: "work-friendly",
          opened: "true",
          distance: 20,
          lat: 3.1578,
          lng: 101.7117
        }).status_published

        # Should not raise an error and should return correct results
        expect { result.to_a }.not_to raise_error
        expect(result).to include(coffee_shop1)
        expect(result).not_to include(coffee_shop2, coffee_shop3, unpublished_shop)

        # Verify distance_in_km is available
        expect(result.first.distance_in_km).to be_present
      end

      it "preserves distance ordering when combined with multiple filters" do
        # Set up another coffee shop with the tag but further away
        coffee_shop2.tags << tag1
        coffee_shop2.update(location: "POINT(101.7117 3.1478)") # ~1.1km from search point
        create(:opening_hour, :same_day, coffee_shop: coffee_shop2)

        result = described_class.call(params: {
          tags: "work-friendly",
          opened: "true",
          distance: 20,
          lat: 3.1578,
          lng: 101.7117
        }).status_published

        # Both shops should be included and ordered by distance
        shops = result.to_a
        expect(shops).to eq([coffee_shop1, coffee_shop2])
        expect(shops.first.distance_in_km).to be < shops.second.distance_in_km
      end
    end

    describe "filter_by_rating" do
      before do
        coffee_shop1.update(rating: 4.2)
        coffee_shop2.update(rating: 4.4)
        coffee_shop3.update(rating: 4.6)
      end

      it "returns all coffee shops when no rating filter is applied" do
        result = described_class.call(params: {}).status_published

        expect(result).to include(coffee_shop1, coffee_shop2, coffee_shop3)
        expect(result).not_to include(unpublished_shop)
      end

      it "filters by minimum rating" do
        result = described_class.call(params: {rating: 4.2}).status_published

        expect(result).to include(coffee_shop1) # 4.2
        expect(result).not_to include(coffee_shop2, coffee_shop3, unpublished_shop)
      end

      it "handles rating ranges correctly" do
        result = described_class.call(params: {rating: 4.4}).status_published

        expect(result).to include(coffee_shop2, coffee_shop3) # 4.4
        expect(result).not_to include(coffee_shop1, unpublished_shop)
      end
    end

    describe "filter_by_rating_count" do
      before do
        coffee_shop1.update(rating_count: 45)
        coffee_shop2.update(rating_count: 75)
        coffee_shop3.update(rating_count: 150)
      end

      it "returns all coffee shops when no rating count filter is applied" do
        result = described_class.call(params: {}).status_published

        expect(result).to include(coffee_shop1, coffee_shop2, coffee_shop3)
        expect(result).not_to include(unpublished_shop)
      end

      it "filters by minimum rating count" do
        result = described_class.call(params: {rating_count: 50}).status_published

        expect(result).to include(coffee_shop2) # 75 ratings
        expect(result).not_to include(coffee_shop1, coffee_shop3, unpublished_shop)
      end

      it "handles rating count ranges correctly" do
        result = described_class.call(params: {rating_count: 100}).status_published

        expect(result).to include(coffee_shop3) # 150 ratings
        expect(result).not_to include(coffee_shop1, coffee_shop2, unpublished_shop)
      end

      it "handles high rating counts correctly" do
        coffee_shop1.update(rating_count: 1200)
        result = described_class.call(params: {rating_count: 1000}).status_published

        expect(result).to include(coffee_shop1)
        expect(result).not_to include(coffee_shop2, coffee_shop3, unpublished_shop)
      end
    end

    describe "filter_by_collection" do
      let!(:user) { create(:user) }
      let!(:collection) { create(:collection, user: user) }
      let!(:other_collection) { create(:collection) }

      before do
        # Create bookmarks for user's collection
        bookmark1 = create(:bookmark, user: user, coffee_shop: coffee_shop1)
        bookmark2 = create(:bookmark, user: user, coffee_shop: coffee_shop2)

        # Add bookmarks to user's collection
        create(:bookmark_collection, bookmark: bookmark1, collection: collection)
        create(:bookmark_collection, bookmark: bookmark2, collection: collection)

        # Create a bookmark for different collection (should not appear in results)
        bookmark3 = create(:bookmark, user: user, coffee_shop: coffee_shop3)
        create(:bookmark_collection, bookmark: bookmark3, collection: other_collection)
      end

      it "returns all coffee shops when no collection filter is applied" do
        result = described_class.call(
          params: {},
          current_user: user
        ).status_published

        expect(result).to include(coffee_shop1, coffee_shop2, coffee_shop3)
        expect(result).not_to include(unpublished_shop)
      end

      it "returns only coffee shops in the specified collection for the current user" do
        result = described_class.call(
          params: {collection_id: collection.id},
          current_user: user
        ).status_published

        expect(result).to include(coffee_shop1, coffee_shop2)
        expect(result).not_to include(coffee_shop3, unpublished_shop)
      end

      it "returns empty when collection doesn't belong to current user" do
        other_user = create(:user)
        result = described_class.call(
          params: {collection_id: collection.id},
          current_user: other_user
        ).status_published

        expect(result).to be_empty
      end

      it "returns empty when collection_id doesn't exist" do
        result = described_class.call(
          params: {collection_id: 99999},
          current_user: user
        ).status_published

        expect(result).to be_empty
      end

      it "returns all coffee shops when no current_user is provided" do
        result = described_class.call(
          params: {collection_id: collection.id},
          current_user: nil
        ).status_published

        expect(result).to include(coffee_shop1, coffee_shop2, coffee_shop3)
        expect(result).not_to include(unpublished_shop)
      end

      it "combines collection filter with other filters" do
        # Add a tag to one of the bookmarked coffee shops
        tag = create(:tag, slug: "wifi")
        coffee_shop1.tags << tag

        result = described_class.call(
          params: {
            collection_id: collection.id,
            tags: "wifi"
          },
          current_user: user
        ).status_published

        expect(result).to include(coffee_shop1)
        expect(result).not_to include(coffee_shop2, coffee_shop3, unpublished_shop)
      end

      context "when testing the specific bug we fixed" do
        it "correctly joins through bookmarks table to access user_id" do
          # This test ensures we fixed the "column bookmark_collections.user_id does not exist" error
          expect {
            described_class.call(
              params: {collection_id: collection.id},
              current_user: user
            ).status_published.to_a
          }.not_to raise_error

          # And verify the correct data is returned
          result = described_class.call(
            params: {collection_id: collection.id},
            current_user: user
          ).status_published

          expect(result).to include(coffee_shop1, coffee_shop2)
          expect(result).not_to include(coffee_shop3)
        end
      end
    end
  end
end
