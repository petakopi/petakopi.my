class Api::V1::CoffeeShopsController < ApiController
  def index
    coffee_shops =
      CoffeeShop
        .includes(
          logo_attachment: :blob
        )
        .status_published

    # Default ordering
    order_clause = {id: :desc}

    # Filter by distance if lat, lng, and distance parameters are provided
    if params[:lat].present? && params[:lng].present? && params[:distance].present?
      lat = params[:lat].to_f
      lng = params[:lng].to_f
      distance_in_km = params[:distance].to_i

      # Create a point from the provided coordinates
      point = "POINT(#{lng} #{lat})"

      # Filter coffee shops within the specified distance
      coffee_shops = coffee_shops.where(
        "ST_DWithin(location, ST_SetSRID(ST_GeomFromText(?), 4326), ?)",
        point,
        distance_in_km * 1000 # Convert km to meters for ST_DWithin
      )

      # Use distance-based ordering instead of id-based ordering
      distance_sql = "ST_Distance(location, ST_SetSRID(ST_GeomFromText('#{point}'), 4326))"
      coffee_shops = coffee_shops.order(Arel.sql(distance_sql))

      # For cursor pagination, we need to use a custom order
      order_clause = Arel.sql(distance_sql)
    end

    @page =
      coffee_shops
        .cursor_paginate(
          before: params[:before],
          after: params[:after],
          limit: DEFAULT_ITEMS_PER_PAGE,
          order: order_clause
        )
        .fetch
  end

  def show
    @coffee_shop = CoffeeShop.find_by!(uuid: params[:id])
  end
end
