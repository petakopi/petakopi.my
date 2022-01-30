class CoffeeShop < ApplicationRecord
  enum status: {unpublished: 0, published: 1}, _prefix: :status
end
