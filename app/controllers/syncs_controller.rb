class SyncsController < ApplicationController
  before_action :set_coffee_shop

  def opening_hours
    if OpeningHoursSyncThrottler.allowed?(coffee_shop: @coffee_shop)
      OpeningHoursWorker.perform_async(@coffee_shop.id)

      return redirect_to @coffee_shop,
        notice: "Opening hours synchronization has been queued. Please wait a few minutes."
    end

    redirect_to @coffee_shop,
      alert: "You have reached the maximum number of opening hours synchronizations per day. Please try again later."
  end

  private

  def set_coffee_shop
    @coffee_shop = current_user.coffee_shops.find(params[:coffee_shop_id])
  end
end
