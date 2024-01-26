class Auction < ApplicationRecord
  has_many :bids

  has_rich_text :description

  def to_param
    slug
  end
end
