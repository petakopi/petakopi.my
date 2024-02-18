class CoffeeShopsController < ApplicationController
  before_action :authenticate_user!, only: [:index]
  before_action :set_coffee_shop, only: %i[show]
  before_action :set_coffee_shop_by_current_user, only: %i[edit update]

  def index
  end

  def show
    @coffee_shop = @coffee_shop.extend(OpeningHourStatus)
    @opening_hours = OpeningHoursPresenter.new(@coffee_shop.opening_hours).list

    ahoy.track "View Coffee Shop", id: @coffee_shop.id, name: @coffee_shop.name
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
        format.html { redirect_to new_coffee_shop_path, notice: success_message }
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
        format.html do
          redirect_to edit_coffee_shop_path(coffee_shop_id: @coffee_shop.slug),
            notice: "Coffee shop was successfully updated."
        end
        format.json { render :show, status: :ok, location: @coffee_shop }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @coffee_shop.errors, status: :unprocessable_entity }
      end
    end
  end

  private

  def set_coffee_shop
    coffee_shop = CoffeeShop.status_published.includes(:opening_hours)

    @coffee_shop =
      coffee_shop.find_by(slug: params[:id]) ||
      coffee_shop.find_by(id: params[:id].to_i)

    # Should only happpen when the coffee shop is rejected since we don't give
    # the unpublished URL to the user
    if @coffee_shop.nil?
      redirect_to root_url,
        status: :moved_permanently,
        alert: "You may have requested a coffee shop that does not exist anymore. Contact us if you think this is a mistake."
    end
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
        :instagram,
        :twitter,
        :facebook,
        :tiktok,
        :whatsapp,
        :logo,
        tag_ids: []
      )
  end

  def success_message
    "Coffee shop was successfully submitted. Please give us some time to review it. "\
    "Feel free to message us at <a href='https://instagram.com/petakopi.my' target='_blank'>@petakopi.my</a> on Instagram "\
    "for any question."
  end
end
