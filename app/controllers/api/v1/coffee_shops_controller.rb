class Api::V1::CoffeeShopsController < ApplicationController
  def index
    @coffee_shops =
      Rails.cache.fetch(
        ["coffee_shops", "api"],
        expires_in: 1.hour,
        race_condition_ttl: 15.seconds
      ) do
        CoffeeShop
          .includes(logo_attachment: :blob)
          .status_published
          .where
          .not(lat: nil, lng: nil)
          .select(:id, :name, :slug, :lat, :lng)
      end

    headers["Cache-Control"] = "max-age=#{60.minute.to_i}, public"
  end
end
