class Auction < ApplicationRecord
  validates :title, presence: true, uniqueness: true
  validates :slug, presence: true, uniqueness: true
  validates :description, presence: true
  validates :start_at, presence: true
  validates :end_at, presence: true

  has_many :bids

  def to_param
    slug
  end
end
