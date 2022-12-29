class Favourite < ApplicationRecord
  belongs_to :coffee_shop
  belongs_to :user

  validates :coffee_shop, uniqueness: {scope: :user}
end
