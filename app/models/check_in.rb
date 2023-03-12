class CheckIn < ApplicationRecord
  include CheckIns::CheckInable

  belongs_to :coffee_shop
  belongs_to :user

  validates :lat, presence: true
  validates :lng, presence: true
end
