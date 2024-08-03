class InboxController < ApplicationController
  before_action :authenticate_user!, only: [:index]

  def index
    @feedbacks =
      current_user
        .feedbacks
        .includes(:user, :coffee_shop)
        .order(created_at: :desc)
  end

  def show
    # We may need to add different types of inbox content
    feedback_id = params[:id]&.split(":").last
    @feedback =
      current_user.feedbacks.includes(:coffee_shop).find(feedback_id)
  end
end
