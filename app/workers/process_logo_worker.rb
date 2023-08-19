class ProcessLogoWorker < SidekiqWorker
  sidekiq_options retry: 5

  def perform(coffee_shop_id)
    coffee_shop = CoffeeShop.find(coffee_shop_id)

    LogoProcessor.call(coffee_shop: coffee_shop)
  end
end
