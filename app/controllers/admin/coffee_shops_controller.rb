class Admin::CoffeeShopsController < AdminController
  before_action :set_coffee_shop, only: %i[show edit update]

  def index
    @coffee_shops = CoffeeShop.order(created_at: :desc)
  end

  def edit
    if @coffee_shop.status_published? && current_user.moderator?
      redirect_to admin_coffee_shops_path, alert: "Moderator can only access unpublished coffee shop"
    end
  end

  def update
    respond_to do |format|
      if !current_user.admin? && coffee_shop_params[:status] == "published"
        flash.now[:alert] = "You are not authorized to publish a Coffee Shop"

        format.html { render :edit, status: :unprocessable_entity }
      elsif @coffee_shop.update(coffee_shop_params)
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
        :twitter,
        :waze,
        tag_ids: []
      )
  end
end
