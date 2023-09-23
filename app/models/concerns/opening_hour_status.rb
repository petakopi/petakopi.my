module OpeningHourStatus
  def opening_hour_status
    current_day = Time.current.wday
    current_time = Time.current.strftime("%H%M").to_i

    schedules =
      opening_hours.order(:day, :time).select { |oh| oh.day == current_day }

    return "Closed for today" unless schedules.present?

    openings = schedules.select { |x| x.kind == "open" }.pluck(:time)
    closings = schedules.select { |x| x.kind == "close" }.pluck(:time)

    openings_with_now = (openings + [current_time]).sort
    closings_with_now = (closings + [current_time]).sort

    position_in_open = openings_with_now.index(current_time)
    position_in_close = closings_with_now.index(current_time)

    # m [x x] [x x]
    if current_time < openings.first
      "Closed"
    # [x x] [x x] m
    elsif current_time > closings.last
      "Closed"
    # [x x] [x m x]
    elsif (position_in_open != openings_with_now.last) && (position_in_close != closings_with_now.last)
      "Open"
    # [x x] m [x x]
    elsif ((position_in_open != openings_with_now.first) || (position_in_open != openings_with_now.last)) &&
        ((position_in_close != closings_with_now.first) || (position_in_close != closings_with_now.last))
      "Open"
    else
      "Unknown"
    end
  end
end

