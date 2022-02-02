class CoffeeShopsController < ApplicationController
  before_action :set_coffee_shop, only: %i[show]

  def index
    @coffee_shops = CoffeeShop.status_published
  end

  def show
  end

  def new
    @coffee_shop = CoffeeShop.new
  end

  def create
    @coffee_shop = CoffeeShop.new(coffee_shop_params)
    @coffee_shop.submitter = current_user

    respond_to do |format|
      if @coffee_shop.save
        format.html { redirect_to coffee_shop_url(@coffee_shop), notice: "Coffee shop was successfully submitted for review." }
        format.json { render :show, status: :created, location: @coffee_shop }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @coffee_shop.errors, status: :unprocessable_entity }
      end
    end
  end

  private

  def set_coffee_shop
    @coffee_shop = CoffeeShop.find_by!(slug: params[:id])
  end

  def coffee_shop_params
    params
      .require(:coffee_shop)
      .permit(
        :name,
        :district,
        :state,
        :google_map,
        :waze,
        :instagram,
        :facebook,
        :twitter
      )
  end
end
