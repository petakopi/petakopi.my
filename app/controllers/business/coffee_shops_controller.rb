class Business::CoffeeShopsController < ApplicationController
  before_action :authenticate_user!, only: [:index]

  def index
    @coffee_shops = current_user.coffee_shops
  end

  def edit
    @coffee_shop = get_coffee_shop
  end

  def update
    @coffee_shop = get_coffee_shop

    respond_to do |format|
      if @coffee_shop.update(coffee_shop_params)
        format.html do
          redirect_to edit_business_coffee_shop_path(id: @coffee_shop.slug),
            notice: "Coffee shop was successfully updated."
        end
      else
        format.html do
          render :edit, status: :unprocessable_entity
        end
      end
    end
  end

  def stats
    @coffee_shop = get_coffee_shop

    @visits =
      Ahoy::Event.where_event(
        "View Coffee Shop",
        id: @coffee_shop.id
      ).where(time: 90.days.ago..).group_by_day(:time).count

    @outbound_links = @coffee_shop.urls.select { |k, v| v.present? }.keys
  end

  private

  def coffee_shop_params
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

  def get_coffee_shop
    current_user.coffee_shops.find_by(slug: params[:id]) ||
      current_user.coffee_shops.find(params[:id].to_i)
  end
end
