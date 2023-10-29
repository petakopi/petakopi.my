class DirectoriesController < ApplicationController
  before_action :modify_params
  before_action :set_page_info

  def index
    set_silver_shop

    @coffee_shops =
      CoffeeShopsListQuery.call(
        params: params,
        relation:
          CoffeeShop
            .joins(:google_location)
            .includes(:tags, logo_attachment: :blob)
      )
    @coffee_shops = @coffee_shops.status_published

    ahoy.track "View Directory", district: params[:district], state: params[:state]

    @pagy, @coffee_shops = pagy(@coffee_shops, items: 20)
  end

  private

  # TODO: Improvements
  # Most likely we need to lowercase everything for optimal search speed.
  # However, we need a proper way to present the state such as WP Kuala Lumpur
  def modify_params
    params[:state] = params[:state].titleize if params[:state].present?
    params[:district] = params[:district].titleize if params[:district].present?

    params[:state].gsub!("Wp ", "WP ")
  end

  def set_page_info
    location = params[:district].present? ? "#{params[:district]}, #{params[:state]}" : params[:state]

    @page_info = "Coffee Shops in #{location}"
  end

  def set_silver_shop
    parameterized_state = params[:state]&.parameterize
    silver_shop_slug = Rails.cache.fetch("ads/silver/#{parameterized_state}")

    @silver_shop = CoffeeShop.find_by(slug: silver_shop_slug)
  end
end
