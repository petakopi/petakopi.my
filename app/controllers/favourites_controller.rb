class FavouritesController < ApplicationController
  before_action :set_coffee_shop

  def create
    if current_user
      @coffee_shop
        .favourites
        .create!(user: current_user)
    end

    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: turbo_stream.replace(
          "#{helpers.dom_id(@coffee_shop)}_favourites",
          partial: "coffee_shops/favourites",
          locals: {coffee_shop: @coffee_shop}
        )
      end
    end
  end

  def destroy
    @coffee_shop
      .favourites
      .find_by(id: params[:id], user: current_user)
      .destroy!

    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: turbo_stream.replace(
          "#{helpers.dom_id(@coffee_shop)}_favourites",
          partial: "coffee_shops/favourites",
          locals: {coffee_shop: @coffee_shop}
        )
      end
    end
  end

  private

  def set_coffee_shop
    @coffee_shop =
      CoffeeShop.find_by(slug: params[:coffee_shop_id]) ||
      CoffeeShop.find(params[:id].to_i)
  end
end
