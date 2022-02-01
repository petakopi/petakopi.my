class CoffeeShop < ApplicationRecord
  serialize :urls, HashSerializer
  store_accessor :urls,
    :facebook,
    :google_embed,
    :google_map,
    :instagram,
    :twitter,
    :waze

  enum status: {unpublished: 0, published: 1}, _prefix: :status

  belongs_to :submitter, class_name: "User", foreign_key: "submitter_user_id", optional: true

  validates :slug, presence: true
  validates :slug, uniqueness: true
  validates :name, uniqueness: true
  validates :state, presence: true
  validates :district, presence: true
  validate :verify_district_in_state

  before_validation :assign_slug

  def assign_slug
    return if name.blank?

    self.slug = name.parameterize
  end

  def verify_district_in_state
    return if state.nil? || district.nil?

    Location.find_by(city: district).state == state
  end
end
