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
          start_time: normalize_time_format(oh["open"]["time"]),
          close_day: oh["close"]["day"],
          close_time: normalize_time_format(oh["close"]["time"])
        }
      end

    return if hours.blank?

    OpeningHour.insert_all(hours)
  end

  # Convert Google time format to database integer format
  # Examples: "0730" -> 730, "1730" -> 1730, "07:30" -> 730
  def normalize_time_format(time_str)
    return nil if time_str.nil?

    # Remove any colons from the time string
    normalized = time_str.to_s.delete(":")

    # Convert to integer, removing leading zeros
    normalized.to_i
  end

  def record_opening_hours_sync
    SyncLog.create!(
      syncable: coffee_shop,
      message: OpeningHoursSyncThrottler::MESSAGE
    )
  end
end
