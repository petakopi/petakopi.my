class CoffeeShops::LocationsController < ApplicationController
  before_action :authenticate_user!

  def edit
    @coffee_shop =
      current_user.coffee_shops.find_by(slug: params[:coffee_shop_id]) ||
      current_user.coffee_shops.find(params[:coffee_shop_id].to_i)
  end

  def update
    @coffee_shop =
      current_user.coffee_shops.find_by(slug: params[:coffee_shop_id]) ||
      current_user.coffee_shops.find(params[:coffee_shop_id].to_i)

    if @coffee_shop.google_location.update(permitted_params[:google_location_attributes])
      redirect_to edit_coffee_shop_location_path(coffee_shop_id: @coffee_shop.slug),
        notice: "Location has been updated"
    else
      @coffee_shop = @coffee_shop.coffee_shop

      render :edit, status: :unprocessable_entity
    end
  end

  private

  def permitted_params
    params
      .require(:coffee_shop)
      .permit(
        google_location_attributes: [
          :lat,
          :lng,
          :place_id,
        ],
      )
  end
end
