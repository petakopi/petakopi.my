class CoffeeShops::FeedbacksController < ApplicationController
  before_action :authenticate_user!

  def index
    @coffee_shop = current_user.coffee_shops.find_by(slug: params[:coffee_shop_id])

    @feedbacks = @coffee_shop.feedbacks.order(created_at: :desc)
  end

  def show
    @coffee_shop = current_user.coffee_shops.find_by(slug: params[:coffee_shop_id])
    @feedback = @coffee_shop.feedbacks.find(params[:id])

    if @feedback.opened_at.nil?
      @feedback.update!(opened_at: Time.current)

      UsersMailer
        .opened_feedback_email(@feedback.id)
        .deliver_later
    end
  end
end
