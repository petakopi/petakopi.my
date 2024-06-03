class Bookmark < ApplicationRecord
  belongs_to :user
  belongs_to :coffee_shop

  has_many :bookmark_collections, dependent: :destroy
  has_many :collections, through: :bookmark_collections

  scope :with_published_coffee_shop, -> { joins(:coffee_shop).merge(CoffeeShop.status_published) }
end
