class CoffeeShopsV2Controller < ApplicationController
  def new
    @coffee_shop = CoffeeShop.new
    @coffee_shop.build_google_location
  end

  def create
    @coffee_shop = CoffeeShopCreatorForm.new(coffee_shop_attributes: coffee_shop_params)

    if @coffee_shop.save
      redirect_to new_coffee_shops_v2_path, notice: success_message
    else
      @coffee_shop = @coffee_shop.coffee_shop

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
        :latitude,
        :logo,
        :longitude,
        :name,
        :tiktok,
        :twitter,
        :whatsapp,
        google_location_attributes: [
          :lat,
          :lng,
          :place_id,
        ],
        tag_ids: [],
      )
  end

  def success_message
    "Coffee shop was successfully submitted. Please give us some time to review it. "\
    "Feel free to message us at <a href='https://instagram.com/petakopi.my' target='_blank'>@petakopi.my</a> on Instagram "\
    "for any question."
  end
end
