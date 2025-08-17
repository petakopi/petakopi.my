class OpeningHoursPresenter
  def initialize(opening_hours)
    @opening_hours = opening_hours
  end

  def list
    previous_day = nil

    formatted_opening_hours =
      @opening_hours
        .sort_by { |x| [x.start_day, x.start_time] }
        .map do |opening_hour|
          opening_hour = ActiveDecorator::Decorator.instance.decorate(opening_hour)

          if opening_hour.start_day_name != previous_day
            display_day = opening_hour.start_day_name
            previous_day = opening_hour.start_day_name
          end

          {
            display_day: display_day,
            start_day: opening_hour.start_day_name,
            start_time: opening_hour.start_time_formatted,
            start_time_raw: opening_hour.start_time,
            close_day: opening_hour.close_day,
            close_time: opening_hour.close_time_formatted,
            close_time_raw: opening_hour.close_time
          }
        end

    current_days = formatted_opening_hours.map { |x| x[:start_day] }.compact.uniq

    return formatted_opening_hours if current_days.count == 7

    missing_days = (0..6).to_a - current_days.map { |x| Date::DAYNAMES.index(x) }
    missing_days.each do |day|
      formatted_opening_hours << {
        display_day: Date::DAYNAMES[day],
        start_day: Date::DAYNAMES[day],
        start_time: "-",
        start_time_raw: 9999, # High value to ensure it sorts last
        close_day: nil,
        close_time: "-"
      }
    end

    # Group by day, sort each group by time, then flatten
    formatted_opening_hours
      .group_by { |x| Date::DAYNAMES.index(x[:start_day]) }
      .sort_by { |day_index, _| day_index }
      .flat_map do |_, hours|
        hours.sort_by { |hour| hour[:start_time_raw] }
      end
  end

  # API format for mobile app - Google My Business API compatible format
  def api_format
    # Get all formatted hours with proper day handling
    formatted_hours = list

    # Group by day to detect multiple slots
    grouped_by_day = formatted_hours.group_by { |hour| Date::DAYNAMES.index(hour[:start_day]) }

    periods = []

    (0..6).each do |day_index|
      day_name = Date::DAYNAMES[day_index]
      google_day_name = day_name.upcase
      day_hours = grouped_by_day[day_index] || []

      # Filter out closed slots (marked with "-")
      open_slots = day_hours.select { |hour| hour[:start_time] != "-" }

      if open_slots.empty?
        # Day is closed - no period entry needed for Google format
        next
      else
        open_slots.each do |slot|
          periods << {
            open: {
              day: google_day_name,
              time: format_time_24hour(slot[:start_time_raw])
            },
            close: {
              day: google_day_name,
              time: format_time_24hour(slot[:close_time_raw] || slot[:start_time_raw])
            }
          }
        end
      end
    end

    {
      business_hours: {
        periods: periods
      }
    }
  end

  private

  # Convert time integer to 24-hour format with colon (e.g., 730 -> "07:30", 1730 -> "17:30")
  def format_time_24hour(time_int)
    return nil if time_int.nil? || time_int == 9999 # Handle closed/invalid times

    str_time = time_int.to_s.rjust(4, "0")
    hour = str_time[0..1]
    minutes = str_time[2..3]
    "#{hour}:#{minutes}"
  end
end
