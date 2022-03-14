namespace :data do
  desc "Import locations from csv"
  task import_locations: :environment do
    require "csv"
    require "open-uri"

    url = "https://gist.githubusercontent.com/amree/70e483a54b16c7c60839062a396a5ae5/raw/b6570580328c05a2434914096632a9770118457b/lazada.csv"

    CSV.parse(URI(url).read, headers: true) do |row|
      location = Location.find_or_create_by(
        country: row["country"],
        state: row["state"],
        city: row["city"],
        postcode: row["postcode"]
      )

      puts location.inspect
    end
  end

  desc "Create tags"
  task create_tags: :environment do
    Tag.create_or_find_by(
      name: "Halal Certified",
      slug: "halal-certified",
      colour: "green"
    )

    Tag.create_or_find_by(
      name: "Muslim Owner",
      slug: "muslim-owner",
      colour: "green"
    )
  end

  desc "Re-run location processor worker for coffee shop without lat lng"
  task populate_missing_lat_lng: :environment do
    CoffeeShop.status_published.where(lat: nil).find_each do |coffee_shop|
      puts "Processing #{coffee_shop.id} - #{coffee_shop.name}"

      LocationProcessorWorker.perform_async(coffee_shop.id)
    end
  end
end
