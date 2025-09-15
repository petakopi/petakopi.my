class Api::V1::CoffeeShopsController < ApiController
  include Pagy::Backend

  def index
    coffee_shops =
      CoffeeShopsListQuery
        .call(
          params: params,
          relation: CoffeeShop.with_details,
          current_user: current_user
        ).status_published

    @pagy, @page = pagy(
      coffee_shops,
      page: params[:page] || 1
    )

    @premium_coffee_shops = premium_coffee_shops

    @page = OpenStruct.new(
      records: @premium_coffee_shops + @page,
      total_pages: @pagy.pages,
      current_page: @pagy.page,
      total_count: @pagy.count,
      empty?: @page.empty?
    )
  end

  def show
    @premium_coffee_shops = premium_coffee_shops

    @coffee_shop = CoffeeShop.includes(:opening_hours, :tags).find_by!(uuid: params[:id])
  end

  def create
    @coffee_shop = CoffeeShopForm.new(coffee_shop_params)

    if @coffee_shop.save
      render json: {
        message: success_message,
        uuid: @coffee_shop.uuid
      }, status: :created
    else
      render json: {
        errors: format_errors(@coffee_shop.errors)
      }, status: :unprocessable_entity
    end
  end

  private

  def premium_coffee_shops
    return CoffeeShop.none if params.except(:controller, :action, :format, :page).present?
    return CoffeeShop.none if params[:page] != "1"

    premium_slugs = Rails.cache.read("ads/gold")&.split(",") || []

    shops = CoffeeShopsListQuery.call(
      relation: CoffeeShop.with_details.where(
        coffee_shops: {slug: premium_slugs}
      )
    )

    shops.sort_by { |shop| premium_slugs.index(shop.slug) }
  end

  def coffee_shop_params
    params.permit(
      :facebook,
      :google_place_id,
      :instagram,
      :location,
      :name,
      :tiktok,
      :tmp_lat,
      :tmp_lng,
      :twitter,
      :whatsapp,
      tag_ids: []
    )
  end

  def success_message
    "Coffee shop was successfully submitted. Please give us some time to review it."
  end
end
