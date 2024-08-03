class OwnersMailer < ApplicationMailer
  def new_feedback_email(coffee_shop_id, user_id)
    @coffee_shop = CoffeeShop.find(coffee_shop_id)
    @user = User.find(user_id)

    mail to: @user.email,
      subject: "You have a new feedback for #{@coffee_shop.name}",
      from: "hello@petakopi.my"
  end

  def outbid_email(auction_id, winners_coffee_shop_ids, user_id)
    @auction = Auction.find(auction_id)
    @user = User.find(user_id)
    @first_winner = CoffeeShop.find(winners_coffee_shop_ids.first)
    @second_winner = CoffeeShop.find(winners_coffee_shop_ids.last)

    mail to: @user.email,
      subject: "Update on Your Ad Auction Bid",
      from: "hello@petakopi.my"
  end

  def last_day_auction_email(auction_id)
    @auction = Auction.find(auction_id)
    winners =
      @auction
        .ordered_bidders
        .limit(Auction::MAXIMUM_WINNERS)
        .pluck(:coffee_shop_id)

    user_ids = @auction.bids.pluck(:user_id)
    emails = User.where(id: user_ids).pluck(:email).uniq

    @first_winner = CoffeeShop.find(winners.first)
    @second_winner = CoffeeShop.find(winners.last)

    mail to: "amree@petakopi.my",
      bcc: emails,
      subject: "Last Day to Bid for #{@auction.title}",
      from: "hello@petakopi.my"
  end
end

