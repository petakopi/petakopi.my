class OpeningHour < ApplicationRecord
  DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ]

  belongs_to :coffee_shop

  # This should have been in the Decorator
  def readable_time
    str_time = time.to_s.rjust(4, "0")

    hour = str_time[0..1].to_i
    minutes = str_time[2..3]
    format = (hour >= 12 ) ? "PM" : "AM"
    hour = (hour > 12 ) ? hour - 12 : hour
    hour = (hour == 0 ) ? 12 : hour

    "#{hour}:#{minutes} #{format}"
  end
end
