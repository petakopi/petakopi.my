class GoogleApi::GoogleLocationSyncer
  include Callable
  include Dry::Monads[:result, :do]

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
      yield refresh_location_from_google
    end

    yield reverse_geocoding

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

  def refresh_location_from_google
    response = HTTP.get("https://maps.googleapis.com/maps/api/geocode/json?place_id=#{@coffee_shop.google_place_id}&key=#{api_key}")

    if response.status.success? && response.parse["error_message"].blank?
      lat = response.parse.dig("results", 0, "geometry", "location", "lat")
      lng = response.parse.dig("results", 0, "geometry", "location", "lng")

      # Create PostGIS point
      @coffee_shop.location = "POINT(#{lng} #{lat})"

      Success(nil)
    else
      Failure("Error refreshing location from Google: #{@coffee_shop.google_place_id} - #{response.parse["error_message"]}")
    end
  end

  def reverse_geocoding
    state_geo = GeoLocation.by_point.find_state_by_point(@coffee_shop.lng, @coffee_shop.lat)
    district_geo = GeoLocation.by_point.find_district_by_point(@coffee_shop.lng, @coffee_shop.lat)

    if state_geo || district_geo
      @coffee_shop.assign_attributes(
        state: state_geo&.name,
        district: district_geo&.name
      )

      Success(nil)
    else
      Failure("Could not find state or district for coordinates: #{@coffee_shop.lat}, #{@coffee_shop.lng}")
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
