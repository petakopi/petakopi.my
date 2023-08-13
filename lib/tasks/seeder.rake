namespace :seeder do
  desc "Import locations from csv"
  task locations: :environment do
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
  task tags: :environment do
    tags = [
      {
        name: "Halal Certified",
        slug: "halal-certified",
        group: "halal",
        description: "Has halal certification from JAKIM"
      },
      {
        name: "Muslim Friendly",
        slug: "muslim-friendly",
        group: "muslim-friendly",
        description: "No pork or alcohol. Foods and drinks use halal ingredients"
      },
      {
        name: "Muslim Owner",
        slug: "muslim-owner",
        group: "halal",
        description: "We assume halal ingredients will be used by default"
      },
      {
        name: "Non Halal",
        slug: "non-halal",
        group: "halal",
        description: "Has or serves pork/alcohol/non-halal ingredients"
      },
      {
        name: "🌖  Night Owl",
        slug: "night-owl",
        description: "Closes at or after 11pm"
      },
      {
        name: "🏝️ Tourism Malaysia",
        slug: "tourism-malaysia",
        description: "Has collaboration with Tourism Malaysia",
        is_public: false,
        position: 0
      }
    ]

    tags.each do |tag|
      Tag.create_or_find_by(tag)
    end
  end
end
