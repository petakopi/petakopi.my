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

    # When distance filtering is active, return all results without pagination
    if params[:lat].present? && params[:lng].present? && params[:distance].present?
      @page = OpenStruct.new(
        records: coffee_shops.to_a,
        previous_cursor: nil,
        next_cursor: nil,
        has_previous?: false,
        has_next?: false,
        empty?: coffee_shops.empty?
      )
    else
      @page =
        coffee_shops
          .cursor_paginate(
            before: params[:before],
            after: params[:after],
            limit: DEFAULT_ITEMS_PER_PAGE
          )
          .fetch
    end
  end

  def show
    @coffee_shop = CoffeeShop.find_by!(uuid: params[:id])
  end
end
