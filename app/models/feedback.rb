class Feedback < ApplicationRecord
  belongs_to :user, optional: true
  belongs_to :coffee_shop

  validates :message, presence: true
end
