namespace :migration do
  desc "Build GoogleLocation"
    task build_google_location: :environment do
    CoffeeShop
      .status_published
      .where.missing(:google_location)
      .order(:id)
      .find_each do |coffee_shop|
        puts "#{coffee_shop.id} - #{coffee_shop.name}"

        coffee_shop.create_google_location(
          place_id: coffee_shop.google_place_id,
          lat: coffee_shop.lat,
          lng: coffee_shop.lng
        )
      end
  end
end
