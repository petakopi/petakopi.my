class CoffeeShop < ApplicationRecord
  has_paper_trail on: [:update]

  serialize :urls, coder: HashSerializer
  store_accessor :urls,
    :facebook,
    :google_embed,
    :google_map,
    :instagram,
    :tiktok,
    :twitter,
    :waze,
    :whatsapp

  attr_accessor :logo_url, :latitude, :longitude, :google_place_id

  enum(
    :status, {
      unpublished: 0,
      published: 1,
      rejected: 2,
      duplicate: 3,
      reviewed: 4,
      closed: 5,
      temporarily_closed: 6
    },
    prefix: :status
  )

  belongs_to :submitter, class_name: "User", foreign_key: "submitter_user_id", optional: true

  has_many :bookmarks
  has_many :sync_logs, as: :syncable, dependent: :destroy
  has_many :coffee_shop_tags, dependent: :destroy
  has_many :tags, through: :coffee_shop_tags
  has_many :coffee_shop_owners
  has_many :owners, through: :coffee_shop_owners, source: :user, dependent: :destroy
  has_many :check_ins, dependent: :destroy
  has_many :favourites
  has_many :favourite_users, through: :favourites, source: :user, dependent: :destroy
  has_many :opening_hours, dependent: :destroy
  has_many :feedbacks

  has_one :google_location, dependent: :destroy
  has_one_attached :logo

  validates :slug, presence: true
  validates :slug, uniqueness: true

  before_validation :clean_urls, on: :create
  before_validation :assign_slug, on: :create
  before_validation :set_uuid

  before_save :update_approved_at

  after_save :process_logo

  accepts_nested_attributes_for :coffee_shop_tags
  accepts_nested_attributes_for :google_location

  has_rich_text :description

  def google_map
    return "#" if google_location.blank?

    google_location.url
  end

  def clean_urls
    self.instagram = instagram.split("/")[3].split("?")[0]
  rescue NoMethodError
  end

  def assign_slug
    if name.blank?
      self.slug = SecureRandom.alphanumeric(5).downcase

      return
    end

    self.slug = [
      name.parameterize,
      SecureRandom.alphanumeric(5).downcase
    ].join("-")
  end

  def set_uuid
    return if uuid.present?

    self.uuid = UUID7.generate
  end

  def process_logo
    return unless logo.attached?
    return unless attachment_changes.dig("logo").present?
    # hack to ensure we only do it if filename is not based on our custom format
    return if logo.filename.to_s.match?(/#{id}-[0-9]+/)

    ProcessLogoWorker.perform_in(2.minutes, id)
  end

  def update_approved_at
    return unless status_changed? && status_published? && approved_at.blank?

    self.approved_at = Time.current
  end

  def self.nearest_to(lat:, lng:, limit_km: 10)
    point = "POINT(#{lng} #{lat})"
    meters = limit_km * 1000
    distance_calc = "ST_Distance(location, ST_SetSRID(ST_GeomFromText('#{point}'), 4326))"

    select("coffee_shops.*, #{distance_calc} AS distance_meters")
      .where("ST_DWithin(location, ST_SetSRID(ST_GeomFromText('#{point}'), 4326), #{meters})")
      .where.not(location: nil)
      .order("distance_meters")
  end

  # def gis_lat
  #   location&.latitude
  # end
  #
  # def gis_lng
  #   location&.longitude
  # end
  #
  # def coordinates=(array)
  #   self.location = "POINT(#{array[1]} #{array[0]})"
  # end
end
