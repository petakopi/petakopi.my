class MapboxController < ApplicationController
  def index
    coffee_shops =
      CoffeeShop
        .includes(logo_attachment: :blob)
        .status_published
        .where.not(location: nil)

    @coffee_shops =
      CoffeeShopsListQuery.call(
        params: params,
        relation: coffee_shops
      )

    ahoy.track "Map Filter", tags: params[:tags] if params[:tags].present?

    @cache_key = ["mapbox", params[:type], params[:tags]]
  end
end
