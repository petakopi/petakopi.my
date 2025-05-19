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
              ),
          current_user: current_user
        ).status_published

    # Default ordering
    order_clause = {created_at: :desc}
    @include_distance = params[:lat].present? && params[:lng].present? && params[:distance].present?

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
