class UsersMailer < ApplicationMailer
  def opened_feedback_email(feedback_id)
    @feedback = Feedback.find(feedback_id)
    @user = @feedback.user
    @coffee_shop = @feedback.coffee_shop

    return if @feedback.user.nil?

    mail to: @user.email,
      subject: "Your feedback for #{@coffee_shop.name} has just been reviewed",
      from: "hello@petakopi.my",
      track_opens: "true",
      message_stream: "outbound"
  end
end

