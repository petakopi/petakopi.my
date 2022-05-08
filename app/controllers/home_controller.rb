class HomeController < ApplicationController
  def index
    @coffee_shops =
      CoffeeShopsListQuery.call(
        params: params,
        relation: CoffeeShop.includes(:tags, logo_attachment: :blob)
      )
    @coffee_shops = @coffee_shops.status_published

    @pagy, @coffee_shops = pagy(@coffee_shops, items: 20)
  end
end
