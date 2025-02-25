class CoffeeShop < ApplicationRecord
  has_paper_trail on: [:update]

  after_save :sync_google_location

  serialize :urls, coder: HashSerializer
  store_accessor :urls,
    :facebook,
    :instagram,
    :tiktok,
    :twitter,
    :whatsapp

  attr_accessor :logo_url

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

  has_one_attached :logo

  validates :slug, presence: true
  validates :slug, uniqueness: true

  before_validation :clean_urls, on: :create
  before_validation :assign_slug, on: :create
  before_validation :set_uuid

  before_save :update_approved_at

  after_save :process_logo

  accepts_nested_attributes_for :coffee_shop_tags

  has_rich_text :description

  def lat
    location&.y
  end

  def lng
    location&.x
  end

  def google_map
    return "#" if location.blank?

    if google_place_id.present?
      "https://www.google.com/maps/search/?api=1&query=#{lat},#{lng}&query_place_id=#{google_place_id}"
    else
      "https://www.google.com/maps/?q=#{lat},#{lng}"
    end
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

  private

  def sync_google_location
    if saved_change_to_google_place_id? || saved_change_to_location?
      GoogleApi::GoogleLocationSyncWorker.perform_async(id)
    end
  end
end
