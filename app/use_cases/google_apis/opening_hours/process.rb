class GoogleApis::OpeningHours::Process < Micro::Case
  attributes :coffee_shop
  attributes :opening_hours

  def call!
    delete_outdated_opening_hours
    create_new_opening_hours
    record_opening_hours_sync

    Success result: {coffee_shop: coffee_shop}
  end

  private

  def current_opening_hours
    @current_opening_hours =
      OpeningHour
        .where(coffee_shop: coffee_shop)
        .order(:day, :time)
        .map do |op|
          [
            op.kind,
            {
              "day" => op.day,
              "time" => op.time.to_s.rjust(4, "0")
            }
          ]
        end
  end

  def delete_outdated_opening_hours
    OpeningHour.where(coffee_shop: coffee_shop).delete_all
  end

  def create_new_opening_hours
    hours =
      opening_hours.map do |oh|
        {
          coffee_shop_id: coffee_shop.id,
          start_day: oh["open"]["day"],
          start_time: oh["open"]["time"],
          close_day: oh["close"]["day"],
          close_time: oh["close"]["time"]
        }
      end

    return if hours.blank?

    OpeningHour.insert_all(hours)
  end

  def record_opening_hours_sync
    SyncLog.create!(
      syncable: coffee_shop,
      message: OpeningHoursSyncThrottler::MESSAGE
    )
  end
end
