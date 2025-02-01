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

  desc "Import states from GeoJSON"
  task states: :environment do |t, args|
    json_data = JSON.parse(File.read("data/states.geojson"))

    factory = RGeo::Cartesian.simple_factory(srid: GeoLocation::SRID)

    ActiveRecord::Base.transaction do
      GeoLocation.transaction do
        json_data.each do |state|
          geometry = state["geofencing"]["features"].first["geometry"]

          # Set the SRID for the geometry
          geom_json = RGeo::GeoJSON.decode(geometry.to_json, geo_factory: factory)

          data = GeoLocation.create!(
            name: state["nama_ms"].titleize.gsub("Wilayah Persekutuan", "").strip,
            kind: "state",
            geom: geom_json
          )
          puts "Created: #{data.name}"
        end
      end
      puts "Import completed!"
    rescue => e
      puts "Error occurred: #{e.message}"
      puts e.backtrace
      raise e
    end
  end

  desc "Import regions from GeoJSON"
  task regions: :environment do |t, args|
    factory = RGeo::Cartesian.simple_factory(srid: GeoLocation::SRID)

    ActiveRecord::Base.transaction do
      Dir.glob("data/state-*.geojson").each do |file_path|
        state_code = file_path.match(/state-(\d+).geojson/)[1]

        puts "Processing: #{file_path}"
        puts "Code: #{state_code}"

        json_data = JSON.parse(File.read(file_path))

        # https://sdk.myinvois.hasil.gov.my/codes/state-codes/
        regions =
          if ["09", "10", "14"].include?(state_code)
            json_data["list_mukim"]
          elsif ["07", "11"].include?(state_code)
            json_data["list_dun"]
          elsif ["04", "12", "13", "16"].include?(state_code)
            json_data["list_parlimen"]
          else
            json_data["list_daerah"]
          end

        regions.each do |region|
          geometry = region["geofencing"]["features"].first["geometry"]
          # Set the SRID for the geometry
          geom_json = RGeo::GeoJSON.decode(geometry.to_json, geo_factory: factory)

          data = GeoLocation.create!(
            name: region["nama_ms"].titleize.gsub(/Daerah|Mukim/, "").strip,
            kind: "region",
            geom: geom_json
          )
          puts "Created: #{data.name}"
        end
      end

      puts "Import completed!"
    end
  rescue => e
    puts "Error occurred: #{e.message}"
    puts e.backtrace
    raise e
  end
end
