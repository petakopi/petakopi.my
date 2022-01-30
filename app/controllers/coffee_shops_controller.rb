class CoffeeShopsController < ApplicationController
  before_action :set_coffee_shop, only: %i[show edit update destroy]

  # GET /coffee_shops or /coffee_shops.json
  def index
    @coffee_shops = CoffeeShop.all
  end

  # GET /coffee_shops/1 or /coffee_shops/1.json
  def show
  end

  # GET /coffee_shops/new
  def new
    @coffee_shop = CoffeeShop.new
  end

  # GET /coffee_shops/1/edit
  def edit
  end

  # POST /coffee_shops or /coffee_shops.json
  def create
    @coffee_shop = CoffeeShop.new(coffee_shop_params)

    respond_to do |format|
      if @coffee_shop.save
        format.html { redirect_to coffee_shop_url(@coffee_shop), notice: "Coffee shop was successfully created." }
        format.json { render :show, status: :created, location: @coffee_shop }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @coffee_shop.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /coffee_shops/1 or /coffee_shops/1.json
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

  # DELETE /coffee_shops/1 or /coffee_shops/1.json
  def destroy
    @coffee_shop.destroy

    respond_to do |format|
      format.html { redirect_to coffee_shops_url, notice: "Coffee shop was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_coffee_shop
    @coffee_shop = CoffeeShop.find(params[:id])
  end

  # Only allow a list of trusted parameters through.
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
