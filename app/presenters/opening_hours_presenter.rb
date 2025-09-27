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

  # API format for mobile app - Google My Business API compatible format with status
  def api_format_with_status
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

    # Calculate current status
    status = calculate_opening_status(formatted_hours, periods)

    {
      opening_hours: {
        periods: periods,
        is_open: status[:is_open],
        current_status: status[:current_status],
        next_change: status[:next_change],
        today_hours: status[:today_hours],
        current_time_slot: status[:current_time_slot]
      }
    }
  end

  # Legacy API format for backward compatibility
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

  # Calculate the current opening status matching mobile app logic
  def calculate_opening_status(formatted_hours, periods)
    # Check if we have no opening hours data at all
    if periods.empty?
      return {
        is_open: false,
        current_status: "Hours not listed",
        next_change: "",
        today_hours: nil,
        current_time_slot: nil
      }
    end

    current_time = Time.current
    current_day = current_time.wday
    current_time_int = current_time.strftime("%H%M").to_i

    # Find hours that could affect the current time
    # This includes:
    # 1. Hours that start today (normal case)
    # 2. Hours that started yesterday but close today (overnight case)
    all_relevant_hours = []

    # Add hours that start on current day
    today_start_hours = formatted_hours.select do |hour|
      Date::DAYNAMES.index(hour[:start_day]) == current_day && hour[:start_time] != "-"
    end
    all_relevant_hours.concat(today_start_hours)

    # Add overnight hours that started yesterday but close today
    yesterday = (current_day - 1) % 7
    yesterday_overnight_hours = formatted_hours.select do |hour|
      start_day_index = Date::DAYNAMES.index(hour[:start_day])
      close_day_index = hour[:close_day] # This is already an integer
      close_time_raw = hour[:close_time_raw]

      # Find hours that started yesterday and close today (overnight)
      # Also verify close_time is in early morning hours (< 600 = 6 AM) to ensure it's truly overnight
      start_day_index == yesterday &&
        close_day_index == current_day &&
        hour[:start_time] != "-" &&
        close_time_raw.present? &&
        close_time_raw < 600 # Close before 6 AM indicates overnight
    end
    all_relevant_hours.concat(yesterday_overnight_hours)

    # Use first slot for basic info (prefer today's start hours)
    today_hours_first = today_start_hours.first || yesterday_overnight_hours.first

    # If no relevant hours for current time
    if all_relevant_hours.empty?
      return {
        is_open: false,
        current_status: "Closed today",
        next_change: get_next_open_day(formatted_hours, current_day),
        today_hours: format_today_hours(nil),
        current_time_slot: "closed"
      }
    end

    # Check each relevant time slot to see if we're currently open
    is_open = false
    current_slot = nil
    next_change = nil

    all_relevant_hours.each do |slot|
      next if slot[:start_time] == "-"

      start_time = slot[:start_time_raw]
      close_time = slot[:close_time_raw] || start_time
      start_day_index = Date::DAYNAMES.index(slot[:start_day])
      close_day_index = slot[:close_day] # This is already an integer

      # Handle different scenarios based on start/close days
      if start_day_index == close_day_index
        # Same day hours (e.g., Monday 9 AM - Monday 5 PM)
        if start_day_index == current_day
          # Handle midnight closing time (0 becomes 2400 for comparison)
          effective_close_time = (close_time == 0) ? 2400 : close_time

          if current_time_int >= start_time && current_time_int < effective_close_time
            # Currently open in this time slot
            is_open = true
            current_slot = slot
            next_change = "Closes at #{readable_time(close_time)}"
            break
          end
        end
      elsif start_day_index == current_day
        # Overnight hours (e.g., Sunday 10 AM - Monday 1 AM)
        if current_time_int >= start_time
          is_open = true
          current_slot = slot
          next_change = "Closes at #{readable_time(close_time)}"
          break
        end
      # We're on the start day - check if current time is after start time
      elsif close_day_index == current_day
        # We're on the close day - check if current time is before close time
        # For overnight hours, close_time is early morning (e.g., 100 = 1:00 AM)
        if current_time_int < close_time
          is_open = true
          current_slot = slot
          next_change = "Closes at #{readable_time(close_time)}"
          break
        end
      end
    end

    if is_open
      return {
        is_open: true,
        current_status: "Open now",
        next_change: next_change,
        today_hours: format_today_hours(current_slot),
        current_time_slot: "open"
      }
    end

    # Currently closed - find next opening time today
    next_open_slot = today_start_hours.find do |slot|
      slot[:start_time] != "-" && slot[:start_time_raw] > current_time_int
    end

    if next_open_slot
      return {
        is_open: false,
        current_status: "Closed",
        next_change: "Opens at #{next_open_slot[:start_time]}",
        today_hours: format_today_hours(next_open_slot),
        current_time_slot: "closed"
      }
    end

    # Closed for the day
    {
      is_open: false,
      current_status: "Closed",
      next_change: get_next_open_day(formatted_hours, current_day),
      today_hours: format_today_hours(today_hours_first),
      current_time_slot: "closed"
    }
  end

  def get_next_open_day(formatted_hours, current_day)
    # Find next open day
    (1..7).each do |days_ahead|
      next_day_index = (current_day + days_ahead) % 7
      next_day = formatted_hours.find do |hour|
        Date::DAYNAMES.index(hour[:start_day]) == next_day_index && hour[:start_time] != "-"
      end

      if next_day
        day_name = (days_ahead == 1) ? "tomorrow" : Date::DAYNAMES[next_day_index]
        return "Opens #{day_name} at #{next_day[:start_time]}"
      end
    end

    "Check back later"
  end

  def format_today_hours(slot)
    return nil if slot.nil?

    {
      day: slot[:start_day],
      day_index: Date::DAYNAMES.index(slot[:start_day]),
      is_closed: slot[:start_time] == "-",
      open_time: (slot[:start_time] == "-") ? nil : format_time_24hour(slot[:start_time_raw]),
      close_time: (slot[:start_time] == "-") ? nil : format_time_24hour(slot[:close_time_raw])
    }
  end

  def readable_time(time_int)
    return "-" if time_int.nil? || time_int == 9999

    str_time = time_int.to_s.rjust(4, "0")
    hour = str_time[0..1].to_i
    minutes = str_time[2..3]
    format = (hour >= 12) ? "PM" : "AM"
    hour = (hour > 12) ? hour - 12 : hour
    hour = (hour == 0) ? 12 : hour

    "#{hour}:#{minutes} #{format}"
  end
end
