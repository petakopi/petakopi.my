class Api::V1::MapsController < ApiController
  def index
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
