class CoffeeShop < ApplicationRecord
  has_paper_trail on: [:update]

  serialize :urls, HashSerializer
  store_accessor :urls,
    :facebook,
    :google_embed,
    :google_map,
    :instagram,
    :tiktok,
    :twitter,
    :waze,
    :whatsapp

  attr_accessor :logo_url

  enum(
    status: {
      unpublished: 0,
      published: 1,
      rejected: 2,
      duplicate: 3,
      reviewed: 4
    },
    _prefix: :status
  )

  belongs_to :submitter, class_name: "User", foreign_key: "submitter_user_id", optional: true
  has_many :coffee_shop_tags
  has_many :tags, through: :coffee_shop_tags
  has_many :coffee_shop_owners
  has_many :owners, through: :coffee_shop_owners, source: :user
  has_many :check_ins, dependent: :destroy
  has_many :favourites
  has_many :favourite_users, through: :favourites, source: :user
  has_many :opening_hours

  has_one_attached :logo

  validates :slug, presence: true
  validates :slug, uniqueness: true
  validate :verify_district_in_state

  before_validation :clean_urls, on: :create
  before_validation :assign_slug, on: :create
  before_validation :convert_google_embed

  before_save :update_approved_at

  after_save :process_logo
  after_save :update_lat_lng
  after_save :update_google_place_id

  accepts_nested_attributes_for :coffee_shop_tags

  has_rich_text :description

  def clean_urls
    self.instagram = instagram.split("/")[3].split("?")[0]
  rescue NoMethodError
  end

  def assign_slug
    if name.blank?
      self.slug = SecureRandom.alphanumeric(5).downcase

      return
    end

    return if district.blank?

    slug = name.parameterize

    if CoffeeShop.where(slug: slug).any?
      slug = "#{slug}-#{district.parameterize}"
    end

    if CoffeeShop.where(slug: slug).any?
      slug = "#{slug}-#{SecureRandom.alphanumeric(5).downcase}"
    end

    self.slug = slug.downcase
  end

  def verify_district_in_state
    return if state.nil? || district.nil?

    Location.find_by(city: district).state == state
  end

  def convert_google_embed
    return if google_embed.blank?
    return unless google_embed.starts_with?("<iframe")

    self.google_embed =
      Nokogiri::HTML.parse(google_embed).xpath("//iframe").attr("src").value
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

  def update_lat_lng
    return unless status_published?
    return if lat.present? && lng.present?

    LocationProcessorWorker.perform_async(id)
  end

  def update_google_place_id
    return unless status_published?
    return if google_place_id.present?

    GetGooglePlaceIdWorker.perform_async(id)
  end
end
