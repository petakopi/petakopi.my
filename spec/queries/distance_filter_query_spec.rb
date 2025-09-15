require "rails_helper"

RSpec.describe DistanceFilterQuery do
  let!(:coffee_shop1) do
    create(
      :coffee_shop,
      name: "Near Coffee",
      location: "POINT(101.7117 3.1578)" # KLCC location
    )
  end
  let!(:coffee_shop2) do
    create(
      :coffee_shop,
      name: "Medium Coffee",
      location: "POINT(101.7117 3.1478)" # ~1.1km from KLCC
    )
  end
  let!(:coffee_shop3) do
    create(
      :coffee_shop,
      name: "Far Coffee",
      location: "POINT(101.4500 3.0333)" # ~25km from KLCC (Klang)
    )
  end

  describe "#call" do
    context "with valid parameters" do
      context "without joins" do
        it "filters coffee shops within specified distance" do
          result = described_class.call(
            relation: CoffeeShop.all,
            lat: 3.1578,
            lng: 101.7117,
            distance_in_km: 2
          )

          expect(result).to include(coffee_shop1, coffee_shop2)
          expect(result).not_to include(coffee_shop3)
        end

        it "adds distance_in_km to the results" do
          result = described_class.call(
            relation: CoffeeShop.all,
            lat: 3.1578,
            lng: 101.7117,
            distance_in_km: 5
          )

          coffee_shop = result.find { |cs| cs.id == coffee_shop1.id }
          expect(coffee_shop.distance_in_km).to be_present
          expect(coffee_shop.distance_in_km).to be_a(Float)
          expect(coffee_shop.distance_in_km).to be < 0.1 # Very close to KLCC
        end

        it "orders results by distance" do
          result = described_class.call(
            relation: CoffeeShop.all,
            lat: 3.1578,
            lng: 101.7117,
            distance_in_km: 50  # Increased to include Klang which is ~25km away
          ).order("distance_in_km ASC")

          shops = result.to_a
          expect(shops.size).to eq(3)
          expect(shops).to eq([coffee_shop1, coffee_shop2, coffee_shop3])

          # Verify distances are in ascending order
          expect(shops[0].distance_in_km).to be < shops[1].distance_in_km
          expect(shops[1].distance_in_km).to be < shops[2].distance_in_km
        end
      end

      context "with joins (complex queries)" do
        let!(:tag) { create(:tag, slug: "specialty") }

        before do
          coffee_shop1.tags << tag
          coffee_shop2.tags << tag
        end

        it "handles queries with joins using CTE" do
          relation = CoffeeShop.joins(:tags).where(tags: {slug: "specialty"})

          result = described_class.call(
            relation: relation,
            lat: 3.1578,
            lng: 101.7117,
            distance_in_km: 2
          )

          expect(result).to include(coffee_shop1, coffee_shop2)
          expect(result).not_to include(coffee_shop3)
        end

        it "preserves distance_in_km with joins" do
          relation = CoffeeShop.joins(:tags).where(tags: {slug: "specialty"})

          result = described_class.call(
            relation: relation,
            lat: 3.1578,
            lng: 101.7117,
            distance_in_km: 5
          )

          coffee_shop = result.find { |cs| cs.id == coffee_shop1.id }
          expect(coffee_shop.distance_in_km).to be_present
          expect(coffee_shop.distance_in_km).to be_a(Float)
        end

        it "avoids duplicate results when using CTE" do
          # Add multiple tags to trigger potential duplicates
          tag2 = create(:tag, slug: "wifi")
          coffee_shop1.tags << tag2

          relation = CoffeeShop.joins(:tags)

          result = described_class.call(
            relation: relation,
            lat: 3.1578,
            lng: 101.7117,
            distance_in_km: 2
          )

          # Check that coffee_shop1 appears only once despite multiple tags
          coffee_shop1_count = result.to_a.count { |cs| cs.id == coffee_shop1.id }
          expect(coffee_shop1_count).to eq(1)
        end
      end
    end

    context "with invalid parameters" do
      it "returns unmodified relation when lat is missing" do
        result = described_class.call(
          relation: CoffeeShop.all,
          lat: nil,
          lng: 101.7117,
          distance_in_km: 2
        )

        expect(result).to eq(CoffeeShop.all)
      end

      it "returns unmodified relation when lng is missing" do
        result = described_class.call(
          relation: CoffeeShop.all,
          lat: 3.1578,
          lng: nil,
          distance_in_km: 2
        )

        expect(result).to eq(CoffeeShop.all)
      end

      it "returns unmodified relation when distance is missing" do
        result = described_class.call(
          relation: CoffeeShop.all,
          lat: 3.1578,
          lng: 101.7117,
          distance_in_km: nil
        )

        expect(result).to eq(CoffeeShop.all)
      end
    end

    context "edge cases" do
      it "handles zero distance by returning unmodified relation" do
        result = described_class.call(
          relation: CoffeeShop.all,
          lat: 3.1578,
          lng: 101.7117,
          distance_in_km: 0
        )

        expect(result).to eq(CoffeeShop.all)
      end

      it "handles very large distances" do
        result = described_class.call(
          relation: CoffeeShop.all,
          lat: 3.1578,
          lng: 101.7117,
          distance_in_km: 1000
        )

        expect(result).to include(coffee_shop1, coffee_shop2, coffee_shop3)
      end

      it "handles decimal coordinates" do
        result = described_class.call(
          relation: CoffeeShop.all,
          lat: 3.157812345,
          lng: 101.711798765,
          distance_in_km: 2
        )

        expect(result).to include(coffee_shop1, coffee_shop2)
        expect(result).not_to include(coffee_shop3)
      end
    end
  end
end
