class Home::CoffeeShopsController < ApplicationController
  def index
    relation =
      CoffeeShop
        .joins(:google_location)
        .includes(:tags, logo_attachment: :blob)

    if params[:location] == "nearby"
      # Temporary
      lat, lng = 3.0825767558408503, 101.52745796471562

      relation = relation.nearest_to(lat: lat, lng: lng)
    end

    @coffee_shops =
      CoffeeShopsListQuery
        .call(
          params: params,
          relation: relation
        )
        .status_published

    @pagy, @coffee_shops = pagy(@coffee_shops, limit: 12, items: 12)
  end
end
