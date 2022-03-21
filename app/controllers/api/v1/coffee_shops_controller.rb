class Api::V1::CoffeeShopsController < ApplicationController
  def index
    @coffee_shops = CoffeeShop.status_published.where.not(lat: nil, lng: nil)

    headers["Cache-Control"] = "max-age=#{60.minute.to_i}, public"
  end
end
