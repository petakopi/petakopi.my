class GoogleApis::OpeningHours::Fetch < Micro::Case
  attributes :coffee_shop
  attributes :opening_hours

  def call!
    get_opening_hours

    if opening_hours.present?
      return Success result: {
        coffee_shop: coffee_shop,
        opening_hours: opening_hours
      }
    end

    Failure result: {
      coffee_shop: coffee_shop,
      msg: "Opening hours not available"
    }
  end

  private

  def api_key
    ENV.fetch("GOOGLE_API_KEY_API")
  end

  def response
    @response ||=
      begin
        params = {
          placeid: coffee_shop.google_location.place_id,
          fields: "opening_hours",
          key: api_key
        }

        path = "/maps/api/place/details/json"

        HTTP.get("https://maps.googleapis.com#{path}?#{params.to_query}")
      end
  end

  def get_opening_hours
    @opening_hours = response.parse.dig("result", "opening_hours", "periods")
  end
end
