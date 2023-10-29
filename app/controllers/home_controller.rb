class HomeController < ApplicationController
  before_action :track_search, only: [:index]

  def index
    @gold_shop = CoffeeShop.find_by(slug: Rails.cache.fetch("ads/gold"))
    @coffee_shops =
      CoffeeShopsListQuery.call(
        params: params,
        relation: CoffeeShop.includes(:tags, :owners, logo_attachment: :blob)
      )
    @coffee_shops = @coffee_shops.status_published
    @filter_counter = calculate_filter_counter

    set_silver_shop

    @pagy, @coffee_shops = pagy(@coffee_shops, items: 20)
  end

  private

  def set_silver_shop
    return if params[:state].blank?

    parameterized_state = params[:state].parameterize
    silver_shop_slug = Rails.cache.fetch("ads/silver/#{parameterized_state}")

    @silver_shop = CoffeeShop.find_by(slug: silver_shop_slug)
    @silver_shop = nil if @silver_shop == @gold_shop
  end

  def track_search
    return if params.blank?

    ahoy.track "Search",
      keyword: params[:keyword],
      state: params[:state],
      district: params[:district],
      tags: params[:tags]
  end

  def calculate_filter_counter
    fields = %i(keyword state district tags)

    fields.reduce(0) do |counter, field|
      if params[field].present?
        counter + 1
      else
        counter
      end
    end
  end
end
