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
end
