class MailerPreviews::OwnersMailerPreview < ActionMailer::Preview
  def new_feedback_email
    OwnersMailer
      .new_feedback_email(CoffeeShop.first.id, User.first.id)
  end

  def auctions_started_email
    OwnersMailer
      .auctions_started_email(User.first.id)
  end
end
