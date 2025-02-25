class GoogleApi::GoogleLocationSyncWorker < SidekiqWorker
  include Sidekiq::Throttled::Worker

  sidekiq_options retry: false
  sidekiq_throttle threshold: {limit: 200, period: 1.minute}

  def perform(coffee_shop_id)
    coffee_shop = CoffeeShop.find(coffee_shop_id)

    result =
      GoogleApi::GoogleLocationSyncer.call(coffee_shop: coffee_shop)

    raise(result.failure) if result.failure?
  end
end
