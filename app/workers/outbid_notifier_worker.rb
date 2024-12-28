class OutbidNotifierWorker < SidekiqWorker
  def perform(auction_id, before_coffee_shop_ids)
    before_coffee_shop_ids =
      before_coffee_shop_ids.uniq.sort

    @auction = Auction.find(auction_id)

    current_winners =
      @auction
        .ordered_bidders
        .first(Auction::MAXIMUM_WINNERS)
        .pluck(:coffee_shop_id)
        .uniq
        .sort

    return if before_coffee_shop_ids == current_winners

    changed_ids = before_coffee_shop_ids - current_winners

    return if changed_ids.empty?

    CoffeeShopOwner
      .where(coffee_shop_id: changed_ids)
      .pluck(:user_id)
      .each do |user_id|
        OwnersMailer
          .outbid_email(
            @auction.id,
            current_winners,
            user_id
          )
          .deliver_later
      end
  end
end
