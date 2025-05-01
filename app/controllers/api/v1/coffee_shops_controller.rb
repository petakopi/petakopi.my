class Api::V1::CoffeeShopsController < ApiController
  def index
    coffee_shops =
      CoffeeShopsListQuery
        .call(
          params: params,
          relation:
            CoffeeShop
              .includes(
                :tags,
                :owners,
                logo_attachment: :blob,
                cover_photo_attachment: :blob
              )
        ).status_published

    # Default ordering
    order_clause = {created_at: :desc}
    @include_distance = false

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

      # Calculate distance in kilometers and add it to the select clause
      distance_sql = "ST_Distance(location, ST_SetSRID(ST_GeomFromText('#{point}'), 4326)) / 1000"
      coffee_shops = coffee_shops.select("coffee_shops.*, #{distance_sql} as distance_in_km")

      # Use distance-based ordering instead of id-based ordering
      coffee_shops = coffee_shops.order(Arel.sql(distance_sql))

      # For cursor pagination, we need to use a custom order
      order_clause = Arel.sql(distance_sql)

      # Set flag to include distance in the JSON response
      @include_distance = true
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
