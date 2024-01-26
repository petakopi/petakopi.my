class Bid < ApplicationRecord
  belongs_to :auction
  belongs_to :coffee_shop
  belongs_to :user

  validates :amount,
    presence: true,
    numericality: {
      greater_than_or_equal_to: ->(record) { record.auction.minimum_amount }
    }
  validate :before_auction_end

  private

  def before_auction_end
    if auction.end_at < Time.current
      errors.add(:base, "Action has already ended")
    end
  end
end
