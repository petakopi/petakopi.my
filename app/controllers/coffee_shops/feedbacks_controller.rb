class CoffeeShops::FeedbacksController < ApplicationController
  def index
    @feedbacks =
      Feedback
        .joins(:coffee_shop)
        .where(coffee_shop: { id: current_user.coffee_shops.pluck(:id) })
        .order(created_at: :desc)
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
