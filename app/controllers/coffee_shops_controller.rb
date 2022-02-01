class CoffeeShopsController < ApplicationController
  before_action :set_coffee_shop, only: %i[show edit update destroy]

  def index
    @coffee_shops = CoffeeShop.status_published
  end

  def show
  end

  def new
    @coffee_shop = CoffeeShop.new
  end

  def edit
  end

  def create
    @coffee_shop = CoffeeShop.new(coffee_shop_params)

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

  def update
    respond_to do |format|
      if @coffee_shop.update(coffee_shop_params)
        format.html { redirect_to coffee_shop_url(@coffee_shop), notice: "Coffee shop was successfully updated." }
        format.json { render :show, status: :ok, location: @coffee_shop }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @coffee_shop.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @coffee_shop.destroy

    respond_to do |format|
      format.html { redirect_to coffee_shops_url, notice: "Coffee shop was successfully destroyed." }
      format.json { head :no_content }
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
        :twitter,
        :status
      )
  end
end
