class Home::CoffeeShopsController < ApplicationController
  def index
    @coffee_shops =
    CoffeeShopsListQuery.call(
      params: params,
      relation:
        CoffeeShop
          .joins(:google_location)
          .includes(:tags, logo_attachment: :blob)
    )
    @coffee_shops = @coffee_shops.status_published
  end
end
