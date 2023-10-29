class OpeningHoursSyncThrottler
  MESSAGE = "Opening hours"
  TIME_LIMIT = 1.day.ago

  def initialize(coffee_shop:)
    @coffee_shop = coffee_shop
  end

  def self.allowed?(coffee_shop:)
    new(coffee_shop: coffee_shop).allowed?
  end

  def last_synced
    @last_synced ||=
      SyncLog
        .where(syncable: @coffee_shop, message: MESSAGE)
        .order(created_at: :desc)
        .first
  end

  def allowed?
    return true if last_synced.nil?
    return true if last_synced.created_at < TIME_LIMIT

    false
  end
end
