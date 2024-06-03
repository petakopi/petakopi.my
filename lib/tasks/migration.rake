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

  desc "Populate GoogleLocation"
  task populate_google_location: :environment do
    GoogleLocation
      .where(locality: nil)
      .or(GoogleLocation.where(administrative_area_level_1: nil))
      .find_each do |google_location|
        puts "#{google_location.id} - #{google_location.place_id}"

        GoogleApi::GoogleLocationSyncWorker.perform_async(google_location.id)
      end
  end

  desc "Migrate favorites to boomarks"
  task migrate_favorites_to_bookmarks: :environment do
    Favorite.find_each do |favorite|
      puts "#{favorite.id} - #{favorite.user_id} - #{favorite.coffee_shop_id}"

      Bookmark.create!(
        user_id: favorite.user_id,
        coffee_shop_id: favorite.coffee_shop_id
      )
    end
  end
end
