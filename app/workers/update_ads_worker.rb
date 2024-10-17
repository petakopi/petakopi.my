class UpdateAdsWorker < SidekiqWorker
  def perform
    slugs_for_ads =
      Bid
        .joins(:auction)
        .where("auctions.period = ?", Time.current.strftime("%Y-%m"))
        .includes(:coffee_shop)
        .order(amount: :desc, created_at: :asc)
        .limit(2)
        .pluck("coffee_shops.slug")
        .join(",")

    Rails.cache.write("ads/gold", slugs_for_ads)

    TelegramNotifierWorker
      .perform_async("Updated ads for the month: #{slugs_for_ads}")
  end
end
