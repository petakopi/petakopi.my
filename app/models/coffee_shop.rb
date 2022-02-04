class CoffeeShop < ApplicationRecord
  serialize :urls, HashSerializer
  store_accessor :urls,
    :facebook,
    :google_embed,
    :google_map,
    :instagram,
    :twitter,
    :waze

  attr_accessor :logo_url

  enum status: {unpublished: 0, published: 1}, _prefix: :status

  belongs_to :submitter, class_name: "User", foreign_key: "submitter_user_id", optional: true
  has_many :coffee_shop_tags
  has_many :tags, through: :coffee_shop_tags

  has_one_attached :logo

  validates :slug, presence: true
  validates :slug, uniqueness: true
  validates :name, uniqueness: true
  validates :state, presence: true
  validates :district, presence: true
  validate :verify_district_in_state

  before_validation :assign_slug

  accepts_nested_attributes_for :coffee_shop_tags

  def assign_slug
    return if name.blank?

    self.slug = name.parameterize
  end

  def verify_district_in_state
    return if state.nil? || district.nil?

    Location.find_by(city: district).state == state
  end
end
