module GoogleApi
  class GoogleCoverPhotoSyncer
    include Callable
    include Dry::Monads[:result, :do]

    ValidationSchema = Dry::Schema.Params do
      optional(:google_place_id).filled(:string)
    end

    PHOTO_MAX_WIDTH = 1200

    def initialize(coffee_shop:)
      @coffee_shop = coffee_shop
    end

    def call
      yield validate_params
      yield fetch_and_process_cover_photo
      Success(@coffee_shop)
    end

    private

    attr_reader :coffee_shop

    def api_key
      @api_key ||= ENV.fetch("GOOGLE_API_KEY_API")
    end

    def validate_params
      result = ValidationSchema.call(coffee_shop.attributes)
      return Success(nil) if result.success?

      Failure(result.errors.to_h)
    end

    def fetch_and_process_cover_photo
      response = fetch_photos_from_google
      return handle_response_failure(response) unless response_successful?(response)

      photos = response.parse.dig("result", "photos")
      return Success(nil) if photos.blank? || photos.first.blank?

      photo_reference = photos.first["photo_reference"]
      return Success(nil) if photo_reference.blank?

      download_and_attach_cover_photo(photo_reference)
      Success(nil)
    rescue => e
      Failure("Error processing cover photo: #{e.message}")
    end

    def fetch_photos_from_google
      HTTP.follow.get(
        "https://maps.googleapis.com/maps/api/place/details/json",
        params: {
          place_id: coffee_shop.google_place_id,
          fields: "photos",
          key: api_key
        }
      )
    end

    def response_successful?(response)
      response.status.success? && response.parse["error_message"].blank?
    end

    def handle_response_failure(response)
      error_message = response.parse["error_message"] || "Unknown error"
      Failure("Error fetching photos from Google: #{coffee_shop.google_place_id} - #{error_message}")
    end

    def download_and_attach_cover_photo(photo_reference)
      response = HTTP.follow.get(
        "https://maps.googleapis.com/maps/api/place/photo",
        params: {
          maxwidth: PHOTO_MAX_WIDTH,
          photo_reference: photo_reference,
          key: api_key
        }
      )

      raise "Failed to download photo: HTTP #{response.status}" unless response.status.success?

      attach_photo_to_coffee_shop(response.body.to_s)
    end

    def attach_photo_to_coffee_shop(photo_data)
      file = Tempfile.new(["google-cover-photo", ".jpg"])
      file.binmode

      begin
        file.write(photo_data)
        file.rewind

        coffee_shop.cover_photo.attach(
          io: file,
          filename: generate_unique_filename,
          content_type: "image/jpeg"
        )
      ensure
        file.close
        file.unlink
      end
    end

    def generate_unique_filename
      "google-cover-photo-#{SecureRandom.hex(8)}.jpg"
    end
  end
end
