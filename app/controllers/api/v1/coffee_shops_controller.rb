class Api::V1::CoffeeShopsController < ApiController
  include Pagy::Backend

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

    # Use Pagy for all cases, including distance filtering
    @pagy, @page = pagy(
      coffee_shops,
      page: params[:page] || 1
    )

    @page = OpenStruct.new(
      records: @page,
      total_pages: @pagy.pages,
      current_page: @pagy.page,
      total_count: @pagy.count,
      empty?: @page.empty?
    )
  end

  def show
    @coffee_shop = CoffeeShop.find_by!(uuid: params[:id])
  end
end
