class OwnersMailer < ApplicationMailer
  def new_feedback_email(coffee_shop_id, user_id)
    @coffee_shop = CoffeeShop.find(coffee_shop_id)
    @user = User.find(user_id)

    mail to: @user.email,
      subject: "You have a new feedback for #{@coffee_shop.name}",
      from: "hello@petakopi.my",
      track_opens: "true",
      message_stream: "outbound"
  end
end

