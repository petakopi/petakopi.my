class Admin::CoffeeShopsController < AdminController
  before_action :set_coffee_shop, only: %i[show edit update]

  def index
    @coffee_shops = CoffeeShop.order(created_at: :desc).status_published
  end

  def edit
  end

  def update
    respond_to do |format|
      if @coffee_shop.update(coffee_shop_params)
        format.html { redirect_to admin_coffee_shop_url(@coffee_shop), notice: "Coffee shop was successfully updated." }
        format.json { render :show, status: :ok, location: @coffee_shop }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @coffee_shop.errors, status: :unprocessable_entity }
      end
    end
  end

  def show
  end

  private

  def set_coffee_shop
    @coffee_shop = CoffeeShop.find(params[:id])
  end

  def coffee_shop_params
    params
      .require(:coffee_shop)
      .permit(
        :district,
        :facebook,
        :google_embed,
        :google_map,
        :instagram,
        :logo,
        :name,
        :slug,
        :state,
        :status,
        :submitter_user_id,
        :twitter,
        :waze
      )
  end
end
