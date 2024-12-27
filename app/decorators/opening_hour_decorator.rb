module OpeningHourDecorator
  def start_day_name
    OpeningHour::DAYS[start_day]
  end

  def start_time_formatted
    readable_time(start_time)
  end

  def close_time_formatted
    readable_time(close_time)
  end

  private

  def readable_time(time)
    str_time = time.to_s.rjust(4, "0")

    hour = str_time[0..1].to_i
    minutes = str_time[2..3]
    format = (hour >= 12) ? "PM" : "AM"
    hour = (hour > 12) ? hour - 12 : hour
    hour = (hour == 0) ? 12 : hour

    "#{hour}:#{minutes} #{format}"
  end
end
