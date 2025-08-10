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
            close_time: opening_hour.close_time_formatted
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

  # API format for mobile app - handles all complex logic here
  def api_format
    # Get all formatted hours with proper day handling
    formatted_hours = list

    # Group by day to detect multiple slots and calculate breaks
    grouped_by_day = formatted_hours.group_by { |hour| Date::DAYNAMES.index(hour[:start_day]) }

    result = []

    (0..6).each do |day_index|
      day_name = Date::DAYNAMES[day_index]
      day_hours = grouped_by_day[day_index] || []

      # Filter out closed slots (marked with "-")
      open_slots = day_hours.select { |hour| hour[:start_time] != "-" }

      if open_slots.empty?
        # Day is closed - add single closed entry
        result << {
          day_index: day_index,
          day: day_name,
          is_closed: true,
          open_time: nil,
          close_time: nil,
          break_start: nil,
          break_end: nil
        }
      else
        # For mobile API, we need to simplify to avoid duplicate keys
        # Use the first slot as primary, but merge time ranges if needed
        primary_slot = open_slots.first

        # If multiple slots exist, find the earliest open and latest close
        open_slots.map { |slot| slot[:start_time] }.min
        open_slots.map { |slot| slot[:close_time] }.max

        # Check if we have multiple distinct time slots (indicating a break)
        break_start = nil
        break_end = nil

        if open_slots.length > 1
          # Sort slots by start time to find breaks
          sorted_slots = open_slots.sort_by { |slot| slot[:start_time_raw] || 9999 }

          # Only set break times if there's a logical gap between slots
          # Check if the first slot's close time is different from the last slot's start time
          sorted_slots.first[:close_time]
          sorted_slots.last[:start_time]

          # Convert to comparable format to check if there's actually a break
          sorted_slots.first[:start_time_raw] # This needs the close_time_raw

          # For now, don't set break times for this edge case to avoid confusion
          # break_start = first_close
          # break_end = last_start
        end

        result << {
          day_index: day_index,
          day: day_name,
          is_closed: false,
          open_time: primary_slot[:start_time],
          close_time: primary_slot[:close_time],
          break_start: break_start,
          break_end: break_end
        }
      end
    end

    result
  end
end
