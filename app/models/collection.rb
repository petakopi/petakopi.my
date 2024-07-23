class Collection < ApplicationRecord
  belongs_to :user

  has_many :bookmark_collections, dependent: :destroy
  has_many :bookmarks, through: :bookmark_collections
  has_many :coffee_shops, through: :bookmarks

  before_validation :set_slug

  validates :name, presence: true, uniqueness: { scope: :user_id }
  validates :slug, presence: true, uniqueness: { scope: :user_id }

  def to_param
    "#{id}-#{slug}"
  end

  def set_slug
    self.slug = name&.parameterize
  end
end
