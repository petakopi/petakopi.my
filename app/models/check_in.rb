class CheckIn < ApplicationRecord
  belongs_to :coffee_shop
  belongs_to :user

  validates :lat, presence: true
  validates :lng, presence: true

  # validate :validate_distance

  private

  def validate_distance
    distance =
      Geocoder::Calculations.distance_between(
        [lat, lng],
        [coffee_shop.lat, coffee_shop.lng]
      )

    return if distance <= 0.1

    errors.add(:base, "You are too far away from the coffee shop")
  end
end
