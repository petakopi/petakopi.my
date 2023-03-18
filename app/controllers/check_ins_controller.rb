 class CheckInsController < ApplicationController
  before_action :authenticate_user!

  def create
    @coffee_shop = CoffeeShop.find(params[:coffee_shop_id])

    CheckIn.create(
      check_in_params.merge(
        user: current_user,
        coffee_shop: @coffee_shop,
      )
    )

    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: turbo_stream.replace(
          "#{helpers.dom_id(@coffee_shop)}_check_in",
          partial: "coffee_shops/check_in",
          locals: {coffee_shop: @coffee_shop}
        )
      end
    end
  end

  private

  def check_in_params
    params
      .require(:check_in)
      .permit(:lat, :lng, :coffee_shop_id)
  end
 end
