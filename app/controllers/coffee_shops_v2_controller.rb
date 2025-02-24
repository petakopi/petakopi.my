class CoffeeShopsV2Controller < ApplicationController
  before_action :validate_cloudflare_turnstile, only: %i[create]

  def new
    @coffee_shop = CoffeeShop.new
  end

  def create
    @coffee_shop = CoffeeShopForm.new(coffee_shop_params)

    if @coffee_shop.save
      redirect_to new_coffee_shops_v2_path, notice: success_message
    else
      render :new, status: :unprocessable_entity
    end
  end

  private

  def coffee_shop_params
    params
      .require(:coffee_shop)
      .permit(
        :facebook,
        :google_place_id,
        :instagram,
        :location,
        :logo,
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
    "Coffee shop was successfully submitted. Please give us some time to review it. " \
    "Feel free to message us at <a href='https://instagram.com/petakopi.my' target='_blank'>@petakopi.my</a> on Instagram " \
    "for any question."
  end
end
