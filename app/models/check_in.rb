class CheckIn < ApplicationRecord
  belongs_to :coffee_shop
  belongs_to :user

  validates :lat, presence: true
  validates :lng, presence: true

  validate :validate_distance
  validate :check_in_once_per_day

  def validate_distance
    distance =
      Geocoder::Calculations.distance_between(
        [lat, lng],
        [coffee_shop.lat, coffee_shop.lng]
      )

    return if distance <= 0.1

    errors.add(:base, "You are too far away from the coffee shop")
  end

  def check_in_once_per_day
    return unless user.checked_in?(coffee_shop)

    require 'pry'; binding.pry

    errors.add(:base, "You have already checked in today")
  end
end
