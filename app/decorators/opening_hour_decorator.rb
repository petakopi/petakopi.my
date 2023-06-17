module OpeningHourDecorator
  def open_day_text
    OpeningHour::DAYS[open_day]
  end

  def close_day_text
    OpeningHour::DAYS[close_day]
  end

  def open_time_text
    format_time(open_time)
  end

  def close_time_text
    format_time(close_time)
  end

  private

  def format_time(time)
    hour = time[0..1].to_i
    minutes = time[2..3]
    format = hour >= 12 ? "PM" : "AM"
    hour = hour > 12 ? hour - 12 : hour
    hour = hour == 0 ? 12 : hour

    "#{hour}:#{minutes} #{format}"
  end
end
