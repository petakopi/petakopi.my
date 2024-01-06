class ReportCoffeeShopOperationStatusWorker < SidekiqWorker
  sidekiq_options retry: false, throttle: {threshold: 300, period: 1.minute}

  def perform(coffee_shop_id)
    coffee_shop = CoffeeShop.find(coffee_shop_id)
    throttler = ClosedCoffeeShopThrottler

    return if coffee_shop.blank?
    return unless throttler.allowed?(coffee_shop: coffee_shop)

    UpdateCoffeeShopOperationStatus.call(coffee_shop: coffee_shop)

    SyncLog.create(
      syncable: coffee_shop,
      message: throttler::MESSAGE
    )
  end
end
