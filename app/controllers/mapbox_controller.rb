class MapboxController < ApplicationController
  def index
    coffee_shops =
      CoffeeShop
        .joins(:google_location)
        .includes(logo_attachment: :blob)
        .status_published
        .where.not(google_locations: { lat: nil, lng: nil })
        .select(
          "name",
          "slug",
          "google_locations.lat",
          "google_locations.lng",
        )

    @coffee_shops =
      CoffeeShopsListQuery.call(
        params: params,
        relation: coffee_shops
      )

    ahoy.track "Map Filter", tags: params[:tags] if params[:tags].present?

    @cache_key = ["mapbox", params[:type], params[:tags]]
  end
end
