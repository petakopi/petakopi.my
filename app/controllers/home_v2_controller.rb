class HomeV2Controller < ApplicationController
  DEFAULT_ITEMS_PER_PAGE = 20

  def index
    coffee_shops =
      CoffeeShop
        .includes(
          logo_attachment: :blob
        )
        .status_published

    @page =
      coffee_shops
        .cursor_paginate(
          before: params[:before],
          after: params[:after],
          limit: DEFAULT_ITEMS_PER_PAGE,
          order: {id: :desc}
        )
        .fetch
  end
end
