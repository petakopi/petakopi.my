class GoogleApi::GoogleRatingSyncerWorker < SidekiqWorker
  include Sidekiq::Throttled::Worker

  sidekiq_options retry: false
  sidekiq_throttle threshold: {limit: 200, period: 1.minute}

  def perform(coffee_shop_id)
    coffee_shop = CoffeeShop.find(coffee_shop_id)

    return if coffee_shop.google_place_id.blank?
    return unless Throttler::RatingSyncThrottler.allowed?(coffee_shop: coffee_shop)

    result =
      GoogleApi::GoogleRatingSyncer.call(coffee_shop: coffee_shop)

    raise(result.failure) if result.failure?

    SyncLog.create(
      syncable: coffee_shop,
      message: Throttler::RatingSyncThrottler::MESSAGE
    )
  end
end
