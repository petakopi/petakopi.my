module GoogleApi
  class GoogleRatingSyncer
    include Callable
    include Dry::Monads[:result, :do]

    ValidationSchema = Dry::Schema.Params do
      optional(:google_place_id).filled(:string)
    end

    def initialize(coffee_shop:)
      @coffee_shop = coffee_shop
    end

    def call
      yield validate_params
      yield fetch_and_process_rating
      yield save_coffee_shop
      Success(@coffee_shop)
    end

    private

    def validate_params
      result = ValidationSchema.call(@coffee_shop.attributes)
      return Success(nil) if result.success?

      Failure(result.errors.to_h)
    end

    def fetch_and_process_rating
      url = [
        "https://maps.googleapis.com/maps/api/place/details/json",
        "?place_id=#{@coffee_shop.google_place_id}",
        "&fields=rating,user_ratings_total",
        "&key=#{api_key}"
      ]
      response = HTTP.get(url.join)
      return handle_response_failure(response) unless response.status.success?

      rating = response.parse.dig("result", "rating")
      rating_count = response.parse.dig("result", "user_ratings_total")
      return Success(nil) if rating.blank?

      @coffee_shop.rating = rating
      @coffee_shop.rating_count = rating_count
      Success(nil)
    end

    def api_key
      ENV.fetch("GOOGLE_API_KEY_API")
    end

    def handle_response_failure(response)
      error_message = response.parse["error_message"] || "Unknown error"
      Failure("Error fetching rating from Google: #{@coffee_shop.google_place_id} - #{error_message}")
    end

    def save_coffee_shop
      if @coffee_shop.save
        Success(@coffee_shop)
      else
        Failure(@coffee_shop.errors.full_messages.join(", "))
      end
    end
  end
end
