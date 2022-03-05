class LocationProcessorWorker < SidekiqWorker
  sidekiq_options retry: 3

  def perform(coffee_shop_id)
    coffee_shop = CoffeeShop.find(coffee_shop_id)

    LocationProcessor.call(coffee_shop: coffee_shop)
  end
end
