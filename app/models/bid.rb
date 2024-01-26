class Bid < ApplicationRecord
  belongs_to :auction
  belongs_to :coffee_shop
  belongs_to :user

  validates :amount, presence: true, numericality: { greater_than: 0 }
end
