class OpeningHoursWorker < SidekiqWorker
  sidekiq_options retry: false

  def perform(coffee_shop_id)
    coffee_shop = CoffeeShop.find(coffee_shop_id)

    return unless OpeningHoursSyncThrottler.allowed?(coffee_shop: coffee_shop)

    if coffee_shop.google_place_id.blank?
      GooglePlaceIdProcessor.call(coffee_shop: coffee_shop)
    end

    OpeningHoursProcessor.call(coffee_shop: coffee_shop)
    SyncLog.create(
      syncable: coffee_shop,
      message: OpeningHoursSyncThrottler::MESSAGE
    )
  end
end
