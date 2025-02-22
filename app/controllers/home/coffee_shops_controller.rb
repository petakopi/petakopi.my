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

    @pagy, @coffee_shops = pagy(@coffee_shops, limit: 12, items: 12)
  end
end
