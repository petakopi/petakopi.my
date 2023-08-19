module OpeningHourStatus
  def opening_hour_status
    current_day = Time.current.wday
    current_time = Time.current.strftime("%H%M").to_i

    today_schedule = opening_hours.find { |oh| oh.open_day == current_day }

    # If there's no schedule for today
    return "Closed for today" unless today_schedule

    opening_time = today_schedule.open_time.to_i
    closing_time = today_schedule.close_time.to_i

    closing_time = 2400 if closing_time == 0

    if current_time < opening_time && (opening_time - current_time) <= 30
      "Opening soon"
    elsif current_time < opening_time
      "Closed"
    elsif current_time > closing_time
      "Closed"
    elsif (closing_time - current_time) <= 30
      "Closing soon"
    else
      "Open"
    end
  end
end
