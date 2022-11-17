class HomeController < ApplicationController
  def index
    @coffee_shops =
      CoffeeShopsListQuery.call(
        params: params,
        relation: CoffeeShop.includes(:tags, :owners, logo_attachment: :blob)
      )
    @coffee_shops = @coffee_shops.status_published

    if params[:keyword].present? || params[:state].present? || params[:district].present?
      ahoy.track "Search", keyword: params[:keyword], state: params[:state], district: params[:district]
    end

    if params[:page].blank?
      @pru_15_coffee_shops =
        CoffeeShopsListQuery
          .call(
            params: params,
            relation:
              CoffeeShop
                .joins(:tags)
                .includes(:tags, :owners, logo_attachment: :blob)
                .where(tags: { slug: "pru-15" })
          )
          .shuffle
    end

    @pagy, @coffee_shops = pagy(@coffee_shops, items: 20)
  end
end
