class SyncsController < ApplicationController
  before_action :set_coffee_shop

  def opening_hours
    if @coffee_shop.opening_hours.order(updated_at: :desc).first&.updated_at&.to_date == Time.current.to_date
      redirect_to @coffee_shop, alert: "You are allowed to sync only once a day"
    end

    OpeningHoursWorker.perform_async(@coffee_shop.id)

    redirect_to @coffee_shop,
      notice: "Opening hours sync has been queued. Please wait a few minutes."
  end

  private

  def set_coffee_shop
    @coffee_shop = current_user.coffee_shops.find(params[:coffee_shop_id])
  end
end
