class Api::V1::MapsController < ApiController
  def index
    if params.values_at(:sw_lat, :sw_lng, :ne_lat, :ne_lng).all?(&:present?)
      @coffee_shops =
        CoffeeShop
          .includes(
            logo_attachment: :blob,
          )
          .status_published
          .order(approved_at: :desc)
          .joins(:google_location)
          .merge(
            GoogleLocation.within_bounding_box(
              *params.values_at(:sw_lat, :sw_lng, :ne_lat, :ne_lng)
            )
          )
    else
      @coffee_shops =
        Rails.cache.fetch(
          ["v1", "maps"],
          race_condition_ttl: 10.seconds,
          expires_in: 1.hour
        ) do
            CoffeeShop
              .includes(
                :google_location,
                logo_attachment: :blob,
              )
              .status_published
              .order(approved_at: :desc)
          end
    end
  end
end
