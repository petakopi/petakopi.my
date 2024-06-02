class TellManagersController < ApplicationController
  def new
    @coffee_shop = CoffeeShop.find_by(slug: params[:coffee_shop_id])
    @feedback = Feedback.new
  end

  def create
    @coffee_shop = CoffeeShop.find_by(slug: params[:coffee_shop_id])
    @feedback = @coffee_shop.feedbacks.new(feedback_params)
    @feedback.user = current_user

    if @feedback.save
      message = [
        "Feedback for #{@coffee_shop.name} has been submitted.",
        "Submitted at: #{Time.current}"
      ].join("\n")

      TelegramNotifierWorker.perform_async(message)
      OwnersMailer
        .new_feedback_email(
          @coffee_shop.id,
          @coffee_shop.owners.first.id,
        )
        .deliver_later
    else
      render :new
    end
  end

  private

  def feedback_params
    params.require(:feedback).permit(:message, :contact)
  end
end
