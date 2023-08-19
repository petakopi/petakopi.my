class ReportClosedCoffeeShopWorker < SidekiqWorker
  sidekiq_options retry: false

  def perform(coffee_shop_id)
    coffee_shop = CoffeeShop.find(coffee_shop_id)

    return if coffee_shop.blank?
    return unless ClosedCoffeeShopThrottler.allowed?(coffee_shop: coffee_shop)

    UpdateClosedCoffeeShop.call(coffee_shop: coffee_shop)

    SyncLog.create(
      syncable: coffee_shop,
      message: ClosedCoffeeShopThrottler::MESSAGE
    )
  end
end
