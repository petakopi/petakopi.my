class GoogleApi::GoogleLocationSyncer
  include Callable
  include Dry::Monads[:result, :do]

  NORMALIZED_STATE_NAMES = {
    "Federal Territory of Kuala Lumpur" => "Kuala Lumpur",
    "Johor Darul Ta'zim" => "Johor",
    "Labuan Federal Territory" => "Labuan",
    "Malacca" => "Melaka",
    "Penang" => "Pulau Pinang",
    "Wilayah Persekutuan Kuala Lumpur" => "Kuala Lumpur",
    "Wilayah Persekutuan Labuan" => "Labuan",
    "Wilayah Persekutuan Putrajaya" => "Putrajaya"
  }

  ValidationSchema = Dry::Schema.Params do
    optional(:google_place_id).maybe(:string)
    optional(:location)

    rules do
      rule(:place_or_coords) do
        if values[:google_place_id].blank? && values[:location].blank?
          key.failure("must have either google_place_id or location")
        end
      end
    end
  end

  def initialize(coffee_shop:)
    @coffee_shop = coffee_shop
  end

  def call
    yield validate_params

    if @coffee_shop.google_place_id.present?
      yield get_location_from_google_place
    else
      yield get_location_from_coordinates
    end

    save_coffee_shop
  end

  private

  def api_key
    ENV.fetch("GOOGLE_API_KEY_API")
  end

  def validate_params
    result = ValidationSchema.call(@coffee_shop.attributes)

    if result.success?
      Success(nil)
    else
      Failure(result.errors.to_h)
    end
  end

  def get_location_from_google_place
    response = HTTP.get("https://maps.googleapis.com/maps/api/geocode/json?place_id=#{@coffee_shop.google_place_id}&key=#{api_key}")

    if response.status.success? && response.parse["error_message"].blank?
      lat = response.parse.dig("results", 0, "geometry", "location", "lat")
      lng = response.parse.dig("results", 0, "geometry", "location", "lng")

      # Create PostGIS point
      @coffee_shop.location = "POINT(#{lng} #{lat})"

      # Update address
      address_components = response.parse.dig("results")[0]["address_components"]

      # Extract district (locality)
      district_component = address_components.find { |comp| comp["types"].include?("locality") }
      district = district_component ? district_component["long_name"] : nil

      # Extract state/province (administrative_area_level_1)
      state_component = address_components.find { |comp| comp["types"].include?("administrative_area_level_1") }
      state = state_component ? state_component["long_name"] : nil

      @coffee_shop.assign_attributes(
        district: district,
        state: NORMALIZED_STATE_NAMES[state] || state
      )

      Success(nil)
    else
      Failure("Error refreshing location from Google: #{@coffee_shop.google_place_id} - #{response.parse["error_message"]}")
    end
  end

  def get_location_from_coordinates
    latlng = [@coffee_shop.lat, @coffee_shop.lng].join(",")

    response = HTTP.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=#{latlng}&key=#{api_key}")

    if response.status.success? && response.parse["error_message"].blank?
      address_components = response.parse.dig("results", 0, "address_components")

      # Extract district (locality)
      district_component = address_components.find { |comp| comp["types"].include?("locality") }
      district = district_component ? district_component["long_name"] : nil

      # Extract state (administrative_area_level_1)
      state_component = address_components.find { |comp| comp["types"].include?("administrative_area_level_1") }
      state = state_component ? state_component["long_name"] : nil

      @coffee_shop.assign_attributes(
        district: district,
        state: NORMALIZED_STATE_NAMES[state] || state
      )

      Success(nil)
    else
      Failure("Error refreshing location from coordinates: #{@coffee_shop.lat}, #{@coffee_shop.lng} - #{response.parse["error_message"]}")
    end
  end

  def save_coffee_shop
    if @coffee_shop.save
      Success(@coffee_shop)
    else
      Failure(@coffee_shop.errors.full_messages.join(", "))
    end
  end
end
