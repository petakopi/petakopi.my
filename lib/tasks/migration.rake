namespace :migration do
  # TODO: Remove
  # desc "Populate CoffeeShop.location"
  # task populate_from_google_location: :environment do
  #   CoffeeShop
  #     .status_published
  #     .where(location: nil)
  #     .find_each do |coffee_shop|
  #       puts "Processing #{coffee_shop.id} - #{coffee_shop.name}"
  #       coffee_shop.update(
  #         location: "POINT(#{coffee_shop.google_location.lng} #{coffee_shop.google_location.lat})",
  #         google_place_id: coffee_shop.google_location.place_id
  #       )
  #     end
  #
  #   puts "Done with #{CoffeeShop.status_published.where(location: nil).count} coffee shops left"
  # end

  desc "Populate CoffeeShop.district and CoffeeShop.state"
  task populate_district_state: :environment do
    CoffeeShop
      .status_published
      .find_each do |coffee_shop|
      puts "Processing #{coffee_shop.id} - #{coffee_shop.name}"

      state_geo = GeoLocation.by_point.find_state_by_point(coffee_shop.lng, coffee_shop.lat)
      district_geo = GeoLocation.by_point.find_district_by_point(coffee_shop.lng, coffee_shop.lat)

      if state_geo
        coffee_shop.state = state_geo.name
      end

      if district_geo
        coffee_shop.district = district_geo.name
      end

      coffee_shop.save
    end

    puts "Done with #{CoffeeShop.status_published.where(district: nil).count} coffee shops left"
  end
end
