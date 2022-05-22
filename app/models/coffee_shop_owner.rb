class CoffeeShopOwner < ApplicationRecord
  belongs_to :coffee_shop, touch: true
  belongs_to :user
end
