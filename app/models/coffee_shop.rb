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

  has_one_attached :logo

  validates :slug, presence: true
  validates :slug, uniqueness: true
  validates :name, uniqueness: true
  validates :state, presence: true
  validates :district, presence: true
  validate :verify_district_in_state

  before_validation :assign_slug
  before_validation :attach_logo

  def assign_slug
    return if name.blank?

    self.slug = name.parameterize
  end

  def verify_district_in_state
    return if state.nil? || district.nil?

    Location.find_by(city: district).state == state
  end

  def attach_logo
    # return if logo_url.blank?
    logo_url = "https://i.imgur.com/EHckMX2.jpeg"

    LogoAttacher.call(coffee_shop: self, logo_url: logo_url)
  end
end
