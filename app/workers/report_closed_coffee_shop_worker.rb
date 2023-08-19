class ReportClosedCoffeeShopWorker < SidekiqWorker
  sidekiq_options retry: false

  def perform(coffee_shop_id)
    coffee_shop = CoffeeShop.find(coffee_shop_id)

    return if coffee_shop.blank?

    UpdateClosedCoffeeShop.call(coffee_shop: coffee_shop)
  end
end
