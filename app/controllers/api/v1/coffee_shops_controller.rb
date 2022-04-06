class Api::V1::CoffeeShopsController < ApplicationController
  def index
    @coffee_shops =
      CoffeeShop
        .includes(logo_attachment: :blob)
        .status_published
        .where
        .not(lat: nil, lng: nil)
        .select(:id, :name, :slug, :lat, :lng)

    headers["Cache-Control"] = "max-age=#{5.minute.to_i}, public"
  end
end
