class CheckInsController < ApplicationController
  before_action :authenticate_user!

  def create
    @coffee_shop = CoffeeShop.find(params[:coffee_shop_id])

    @check_in =
      CheckIn.create(
        check_in_params.merge(
          user: current_user,
          coffee_shop: @coffee_shop,
          )
      )
  end

  private

  def check_in_params
    params
      .require(:check_in)
      .permit(:lat, :lng, :coffee_shop_id)
  end
end
