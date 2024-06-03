class Collection < ApplicationRecord
  belongs_to :user

  has_many :bookmark_collections, dependent: :destroy
  has_many :bookmarks, through: :bookmark_collections

  validates :name, presence: true
end
