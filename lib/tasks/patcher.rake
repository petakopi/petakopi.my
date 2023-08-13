namespace :patcher do
  desc "Re-run location processor worker for coffee shop without lat lng"
  task missing_coordinates: :environment do
    CoffeeShop.status_published.where(lat: [nil, ""]).find_each do |coffee_shop|
      puts "Processing #{coffee_shop.id} - #{coffee_shop.name}"

      LocationProcessorWorker.perform_async(coffee_shop.id)
    end
  end
end
