class Api::V1::MapsController < ApiController
  def index
    @coffee_shops = CoffeeShop
      .includes(logo_attachment: :blob)
      .status_published
      .where.not(location: nil)
      .order(approved_at: :desc)

    @coffee_shops = CoffeeShopsListQuery.call(
      params: params,
      relation: @coffee_shops
    )
  end
end
