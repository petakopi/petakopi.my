namespace :patcher do
  desc "Re-run location processor worker for coffee shop without lat lng"
  task missing_coordinates: :environment do
    CoffeeShop.status_published.where(lat: [nil, ""]).find_each do |coffee_shop|
      puts "Processing #{coffee_shop.id} - #{coffee_shop.name}"

      LocationProcessorWorker.perform_async(coffee_shop.id)
    end
  end

  desc "Assign district and state to coffee shop using GeoLocation"
  task geo_location_district_state: :environment do
    CoffeeShop.status_published.find_each do |coffee_shop|
      coffee_shop.google_location&.set_district_state
      coffee_shop.reload

      puts "Processed #{coffee_shop.id} - #{coffee_shop.name} - #{coffee_shop.district}, #{coffee_shop.state}"
    end
  end
end
