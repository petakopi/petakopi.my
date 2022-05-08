class CoffeeShopsController < ApplicationController
  before_action :authenticate_user!, only: [:index]
  before_action :set_coffee_shop, only: %i[show]
  before_action :set_coffee_shop_by_current_user, only: %i[edit update]

  def index
  end

  def show
    @coffee_shop = ActiveDecorator::Decorator.instance.decorate(@coffee_shop)
  end

  def new
    @coffee_shop = CoffeeShop.new
    @coffee_shop.coffee_shop_tags.build
  end

  def create
    @coffee_shop = CoffeeShop.new(coffee_shop_create_params)
    @coffee_shop.submitter = current_user

    respond_to do |format|
      if @coffee_shop.save
        format.html { redirect_to coffee_shop_url(@coffee_shop), notice: success_message }
        format.json { render :show, status: :created, location: @coffee_shop }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @coffee_shop.errors, status: :unprocessable_entity }
      end
    end
  end

  def edit
  end

  def update
    respond_to do |format|
      if @coffee_shop.update(coffee_shop_update_params)
        format.html { redirect_to @coffee_shop, notice: "Coffee shop was successfully updated." }
        format.json { render :show, status: :ok, location: @coffee_shop }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @coffee_shop.errors, status: :unprocessable_entity }
      end
    end
  end

  private

  def set_coffee_shop
    @coffee_shop =
      CoffeeShop.find_by(slug: params[:id]) ||
      CoffeeShop.find(params[:id].to_i)
  end

  def set_coffee_shop_by_current_user
    @coffee_shop =
      current_user.coffee_shops.find_by(slug: params[:id]) ||
      current_user.coffee_shops.find(params[:id].to_i)
  end

  def coffee_shop_create_params
    params
      .require(:coffee_shop)
      .permit(
        :district,
        :facebook,
        :google_map,
        :instagram,
        :logo,
        :name,
        :state,
        :tiktok,
        :twitter,
        :whatsapp,
        tag_ids: []
      )
  end

  def coffee_shop_update_params
    params
      .require(:coffee_shop)
      .permit(
        :description,
        :facebook,
        :instagram,
        :logo,
        :tiktok,
        :twitter,
        :whatsapp,
        tag_ids: []
      )
  end

  def success_message
    "Coffee shop was successfully submitted. Please give us some time to review it. "\
    "Feel free to message us at <a href='https://instagram.com/petakopi.my' target='_blank'>@petakopi.my</a> on Instagram "\
    "for any question."
  end
end
