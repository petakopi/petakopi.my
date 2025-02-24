class HomeController < ApplicationController
  before_action :track_search, only: [:index]

  def index
    @coffee_shops =
      CoffeeShopsListQuery.call(
        params: params,
        relation: CoffeeShop.includes(:tags, logo_attachment: :blob)
      )
    @coffee_shops = @coffee_shops.status_published
    @filter_counter = calculate_filter_counter

    set_gold_shops

    @pagy, @coffee_shops = pagy(@coffee_shops)
  end

  private

  def track_search
    return if params.except(:controller, :action).blank?

    ahoy.track "Search",
      keyword: params[:keyword],
      state: params[:state],
      district: params[:district],
      tags: params[:tags]
  end

  def calculate_filter_counter
    fields = %i[keyword state district tags]

    fields.reduce(0) do |counter, field|
      if params[field].present?
        counter + 1
      else
        counter
      end
    end
  end

  def set_gold_shops
    @gold_shops =
      if params.except(:controller, :action).blank?
        shops = Rails.cache.read("ads/gold")&.split(",")

        first_shop = CoffeeShop.find_by(slug: shops.first) if shops&.first.present?
        second_shop = CoffeeShop.find_by(slug: shops.second) if shops&.second.present?

        [first_shop, second_shop].compact
      end
  end
end
