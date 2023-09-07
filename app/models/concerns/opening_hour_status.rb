module OpeningHourStatus
  def opening_hour_status
    current_day = Time.current.wday
    current_time = Time.current.strftime("%H%M")

    today_schedule = opening_hours.find { |oh| oh.open_day == current_day }

    # If there's no schedule for today
    return "Closed for today" unless today_schedule

    opening_time = today_schedule.open_time.to_i
    closing_time = today_schedule.close_time.to_i

    closing_time = 2400 if closing_time == 0

    if current_time.to_i < opening_time
      if time_difference_in_minutes(opening_time, current_time).abs <= 30
        "Opens soon"
      else
        "Closed"
      end
    elsif current_time.to_i > closing_time
      "Closed"
    elsif time_difference_in_minutes(closing_time, current_time).abs <= 30
      "Closing soon"
    else
      "Open"
    end
  end

  def time_difference_in_minutes(start_time, end_time)
    # Convert HHMM to Time objects
    start_time_obj = Time.parse(start_time.to_s.insert(2, ':'))
    end_time_obj = Time.parse(end_time.to_s.insert(2, ':'))

    # Calculate the difference in minutes
    difference = (end_time_obj - start_time_obj) / 60

    difference.to_i
  end
end

