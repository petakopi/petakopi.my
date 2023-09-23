class OpeningHoursWorker < SidekiqWorker
  sidekiq_options retry: false

  def perform(coffee_shop_id)
    coffee_shop = CoffeeShop.find(coffee_shop_id)

    return unless OpeningHoursSyncThrottler.allowed?(coffee_shop: coffee_shop)

    GoogleApis::OpeningHours::Sync
      .call(coffee_shop: coffee_shop)
      .on_success do |result|
        SyncLog.create(
          syncable: coffee_shop,
          message: OpeningHoursSyncThrottler::MESSAGE
        )
      end
  end
end
