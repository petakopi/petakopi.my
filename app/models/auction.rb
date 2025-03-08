class Auction < ApplicationRecord
  MAXIMUM_WINNERS = 2

  validates :title, presence: true, uniqueness: true
  validates :slug, presence: true, uniqueness: true
  validates :description, presence: true
  validates :start_at, presence: true
  validates :end_at, presence: true

  has_many :bids

  def to_param
    slug
  end

  def ordered_bidders
    bids
      .includes(
        coffee_shop: [
          logo_attachment: :blob
        ]
      )
      .order(
        amount: :desc,
        created_at: :asc
      )
  end
end
