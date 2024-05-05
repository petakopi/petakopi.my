class Admin::CoffeeShopsController < AdminController
  before_action :set_coffee_shop, only: %i[show edit update duplicate sync_opening_hours]

  def index
    @coffee_shops =
      AdminCoffeeShopsListQuery.call(
        params: params,
        relation: CoffeeShop.includes(:submitter, logo_attachment: :blob)
      )
    @coffee_shop_statuses =
      CoffeeShop
        .statuses
        .keys
        .concat(["must_review"])
        .map { |s| [s.titleize, "status_#{s}"] }

    @pagy, @coffee_shops = pagy(@coffee_shops, items: 50)
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
    @opening_hours = OpeningHoursPresenter.new(@coffee_shop.opening_hours).list
  end

  def duplicate
    dup = DuplicateCoffeeShop.call(coffee_shop: @coffee_shop)

    redirect_to edit_admin_coffee_shop_path(dup)
  end

  def sync_opening_hours
    GoogleApis::OpeningHours::Sync
      .call(coffee_shop: @coffee_shop)
      .on_success do |result|
        redirect_to admin_coffee_shop_url(result[:coffee_shop]),
          notice: "Coffee shop opening hours were successfully synced."
      end
      .on_failure do |result|
        redirect_to admin_coffee_shop_url(result[:coffee_shop]),
          alert: result[:msg]
      end
  end

  private

  def set_coffee_shop
    @coffee_shop =
      CoffeeShop
        .includes(:tags, :opening_hours)
        .find(params[:id])
  end

  def coffee_shop_params
    params
      .require(:coffee_shop)
      .permit(
        :admin_notes,
        :description,
        :facebook,
        :instagram,
        :lat,
        :lng,
        :logo,
        :name,
        :slug,
        :status,
        :tiktok,
        :twitter,
        :whatsapp,
        google_location_attributes: [
          :id,
          :lat,
          :lng,
          :place_id,
        ],
        tag_ids: []
      )
  end
end
