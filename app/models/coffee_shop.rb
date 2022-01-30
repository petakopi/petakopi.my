class CoffeeShop < ApplicationRecord
  serialize :urls, HashSerializer
  store_accessor :urls,
    :facebook,
    :google_map,
    :instagram,
    :twitter,
    :waze

  enum status: {unpublished: 0, published: 1}, _prefix: :status
end
