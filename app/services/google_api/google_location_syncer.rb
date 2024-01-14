class GoogleApi::GoogleLocationSyncer
  include Callable
  include Dry::Monads[:result, :do]

  ValidationSchema = Dry::Schema.Params do
    optional(:place_id).maybe(:str?)
    optional(:lat).maybe(:str?)
    optional(:lng).maybe(:str?)

    rules do
      rule(:place_or_coords) do
        if values[:place_id].blank? || (values[:lat].blank? && values[:lng].blank?)
          key.failure("must have either place_id or lat/lng")
        end
      end
    end
  end

  def initialize(google_location:)
    @google_location = google_location
  end

  def call
    yield validate_params

    if fetch_from_place?
      yield fetch_location_from_place_id
    else
      yield reverse_geocoding
    end

    save_google_location
  end

  private

  def api_key
    Rails.application.credentials.dig(:google_api_key, :api)
  end

  def validate_params
    result = ValidationSchema.call(@google_location.attributes)

    if result.success?
      Success(nil)
    else
      Failure(result.errors.to_h)
    end
  end

  def fetch_from_place?
    @google_location.place_id.present?
  end

  def fetch_location_from_place_id
    response = HTTP.get("https://maps.googleapis.com/maps/api/geocode/json?place_id=#{@google_location.place_id}&key=#{api_key}")

    if response.status.success?
      address = response.parse.dig("results", 0, "address_components")

      @google_location.assign_attributes(
        lat:
          response.parse.dig("results", 0, "geometry", "location", "lat"),
        lng:
          response.parse.dig("results", 0, "geometry", "location", "lng"),
        locality:
          address.find { |x| x["types"].include?("locality") }&.[]("long_name"),
        administrative_area_level_1:
          address.find { |x| x["types"].include?("administrative_area_level_1") }&.[]("long_name"),
        administrative_area_level_2:
          address.find { |x| x["types"].include?("administrative_area_level_2") }&.[]("long_name"),
        postal_code:
          address.find { |x| x["types"].include?("postal_code") }&.[]("long_name"),
        country:
          address.find { |x| x["types"].include?("country") }&.[]("long_name")
      )

      Success(nil)
    else
      Failure("Error fetching location from Google using place_id")
    end
  end

  def reverse_geocoding
    latlng = [@google_location.lat, @google_location.lng].join(",")

    response = HTTP.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=#{latlng}&key=#{api_key}")

    if response.status.success?
      address = response.parse.dig("results", 0, "address_components")

      @google_location.assign_attributes(
        locality:
          address.find { |x| x["types"].include?("locality") }&.[]("long_name"),
        administrative_area_level_1:
          address.find { |x| x["types"].include?("administrative_area_level_1") }&.[]("long_name"),
        administrative_area_level_2:
          address.find { |x| x["types"].include?("administrative_area_level_2") }&.[]("long_name"),
        postal_code:
          address.find { |x| x["types"].include?("postal_code") }&.[]("long_name"),
        country:
          address.find { |x| x["types"].include?("country") }&.[]("long_name")
      )

      @google_location.address = result["results"][0]["formatted_address"]

      Success(nil)
    else
      Failure("Error fetching location from Google using lat/lng")
    end
  end

  def save_google_location
    if @google_location.save
      Success(@google_location)
    else
      Failure(@google_location.errors.full_messages.join(", "))
    end
  end
end
