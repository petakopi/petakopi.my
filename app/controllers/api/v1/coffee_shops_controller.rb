class Api::V1::CoffeeShopsController < ApiController
  include Pagy::Backend

  def index
    @premium_slugs = Rails.cache.read("ads/gold")&.split(",") || []

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

    @page = OpenStruct.new(
      records: premium_coffee_shops + @page,
      total_pages: @pagy.pages,
      current_page: @pagy.page,
      total_count: @pagy.count,
      empty?: @page.empty?
    )
  end

  def show
    @coffee_shop = CoffeeShop.find_by!(uuid: params[:id])
  end

  private

  def premium_coffee_shops
    return CoffeeShop.none if @premium_slugs.blank?
    return CoffeeShop.none if params.presence[:page] != "1"

    CoffeeShopsListQuery.call(
      relation: CoffeeShop.with_details.where(
        coffee_shops: {slug: @premium_slugs}
      )
    )
  end
end
