class ProcessCoverPhotoWorker < SidekiqWorker
  sidekiq_options retry: 5

  def perform(coffee_shop_id)
    coffee_shop = CoffeeShop.find(coffee_shop_id)

    CoverPhotoProcessor.call(coffee_shop: coffee_shop)
  end
end
