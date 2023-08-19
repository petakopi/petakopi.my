class OpeningHoursProcessor
  include Callable

  def initialize(coffee_shop:)
    @coffee_shop = coffee_shop
  end

  def call
    CoffeeShop.transaction do
      return if hours.blank?

      hours.each do |hour|
        # Find the opening hour based on coffee_shop_id and open_day
        existing_hour = OpeningHour.find_by(coffee_shop: @coffee_shop, open_day: hour["open"]["day"])

        # Attributes for creation or updating
        attributes = {
          open_day: hour["open"]["day"],
          open_time: hour["open"]["time"],
          close_day: hour["close"]["day"],
          close_time: hour["close"]["time"]
        }

        if existing_hour
          # Update only if the attributes have changed
          existing_hour.update(attributes) unless existing_hour.attributes.slice(*attributes.keys.map(&:to_s)) == attributes
        else
          # Create a new row if not found
          @coffee_shop.opening_hours.create!(attributes)
        end
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
