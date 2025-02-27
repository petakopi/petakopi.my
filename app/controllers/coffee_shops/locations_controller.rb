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

    @coffee_shop = CoffeeShopForm.find(@coffee_shop.id)

    if @coffee_shop.update(permitted_params)
      redirect_to edit_coffee_shop_location_path(coffee_shop_id: @coffee_shop.slug),
        notice: "Location has been updated"
    else
      render :edit, status: :unprocessable_entity
    end
  end

  private

  def permitted_params
    params
      .require(:coffee_shop)
      .permit(
        :google_place_id,
        :tmp_lat,
        :tmp_lng
      )
  end
end
