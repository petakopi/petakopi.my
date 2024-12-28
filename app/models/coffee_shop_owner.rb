class CoffeeShopOwner < ApplicationRecord
  belongs_to :coffee_shop, touch: true
  belongs_to :user

  validates :coffee_shop_id, uniqueness: {scope: :user_id}
end
