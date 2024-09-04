class CoffeeShops::OpeningHoursController < ApplicationController
  before_action :authenticate_user!

  def edit
    @coffee_shop =
      current_user.coffee_shops.find_by(slug: params[:coffee_shop_id]) ||
      current_user.coffee_shops.find(params[:coffee_shop_id].to_i)

    @coffee_shop = @coffee_shop.extend(OpeningHourStatus)
    @opening_hours = OpeningHoursPresenter.new(@coffee_shop.opening_hours).list
    @last_synced = OpeningHoursSyncThrottler.new(coffee_shop: @coffee_shop).last_synced
  end

  def update
    @coffee_shop =
      current_user.coffee_shops.find_by(slug: params[:coffee_shop_id]) ||
      current_user.coffee_shops.find(params[:coffee_shop_id].to_i)

    if OpeningHoursSyncThrottler.allowed?(coffee_shop: @coffee_shop)
      GoogleApis::OpeningHours::Sync
        .call(coffee_shop: @coffee_shop)
        .on_success do |result|
          return redirect_to edit_coffee_shop_opening_hours_path(coffee_shop_id: result[:coffee_shop]),
            notice: "Coffee shop opening hours were successfully synced."
        end
        .on_failure do |result|
          return redirect_to edit_coffee_shop_opening_hours_path(coffee_shop_id: result[:coffee_shop]),
            alert: result[:msg]
        end
    end

    redirect_to edit_coffee_shop_opening_hours_path(coffee_shop_id: @coffee_shop),
      alert: "You can only sync opening hours once every 1 day"
  end
end
