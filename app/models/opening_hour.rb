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
end
