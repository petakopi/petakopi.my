class GoogleApis::OpeningHours::Process < Micro::Case
  attributes :coffee_shop
  attributes :opening_hours

  def call!
    delete_outdated_opening_hours
    create_new_opening_hours

    Success result: { coffee_shop: coffee_shop }
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

  def formatted_opening_hours
    @formatted_opening_hours =
      begin
        tmp = []

        opening_hours.each { |op| op.each { |op_i| tmp << op_i } }

        tmp
      end
  end

  def delete_outdated_opening_hours
    outdated_data = (current_opening_hours - formatted_opening_hours)

    outdated_data.each do |op|
      # Format: ["open", {"day"=>0, "time"=>"2100"}]
      kind = op.first
      day = op.second["day"]
      time = op.second["time"]

      OpeningHour
        .where(coffee_shop: coffee_shop, kind: kind, day: day, time: time.to_i)
        .map(&:destroy)
    end
  end

  def create_new_opening_hours
    hours =
      (formatted_opening_hours - current_opening_hours).map do |x|
        {
          coffee_shop_id: coffee_shop.id,
          kind: x.first,
          day: x.second["day"],
          time: x.second["time"]
        }
      end

    return if hours.blank?

    OpeningHour.insert_all(hours)
  end
end
