class OpeningHoursProcessor
  include Callable

  def initialize(coffee_shop:)
    @coffee_shop = coffee_shop
  end

  def call
    CoffeeShop.transaction do
      # TODO: Do real sync instead of deleting and creating data
      OpeningHour.where(coffee_shop: @coffee_shop).delete_all

      return if hours.blank?

      hours.each do |hour|
        @coffee_shop.opening_hours.create!(
          open_day: hour["open"]["day"],
          open_time: hour["open"]["time"],
          close_day: hour["close"]["day"],
          close_time: hour["close"]["time"]
        )
      end
    end
  end

  private

  def place_id
    @coffee_shop.google_place_id
  end

  def api_key
    Rails.application.credentials.dig(:google_api_key, :api)
  end

  def response
    @response ||=
      HTTP.get("https://maps.googleapis.com/maps/api/place/details/json?placeid=#{place_id}&fields=opening_hours&key=#{api_key}")
  end

  def hours
    response
      .parse
      .dig("result", "opening_hours", "periods")
  end
end
