class CoffeeShop < ApplicationRecord
  has_paper_trail on: [:update]

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

  scope :with_details, -> {
    includes(
      :tags,
      :owners,
      :opening_hours,
      logo_attachment: :blob,
      cover_photo_attachment: :blob
    )
  }

  belongs_to :submitter, class_name: "User", foreign_key: "submitter_user_id", optional: true

  has_many :bookmarks
  has_many :sync_logs, as: :syncable, dependent: :destroy
  has_many :coffee_shop_tags, dependent: :destroy
  has_many :tags, through: :coffee_shop_tags
  has_many :coffee_shop_owners
  has_many :owners, through: :coffee_shop_owners, source: :user, dependent: :destroy
  has_many :favourites
  has_many :favourite_users, through: :favourites, source: :user, dependent: :destroy
  has_many :opening_hours, dependent: :destroy
  has_many :feedbacks
  has_many_attached :photos

  has_one_attached :logo
  has_one_attached :cover_photo

  validates :slug, presence: true
  validates :slug, uniqueness: true

  before_validation :clean_urls, on: :create
  before_validation :assign_slug, on: :create
  before_validation :set_uuid

  before_save :update_approved_at

  after_save :process_logo
  after_save :process_cover_photo
  after_commit :sync_google_location
  after_commit :sync_google_photos, on: :create

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

  private

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
    return unless logo.attachment.present?
    return unless logo.attachment.blob_id_previously_changed?

    ProcessLogoWorker.perform_in(2.minutes, id)
  end

  def process_cover_photo
    return unless cover_photo.attachment.present?
    return unless cover_photo.attachment.blob_id_previously_changed?

    ProcessCoverPhotoWorker.perform_in(2.minutes, id)
  end

  def update_approved_at
    return unless status_changed? && status_published? && approved_at.blank?

    self.approved_at = Time.current
  end

  def sync_google_location
    return unless status_published?
    return unless previous_changes.key?("google_place_id")

    GoogleApi::GoogleLocationSyncWorker.perform_async(id)
  end

  def sync_google_photos
    return unless status_published?

    GoogleApi::GoogleCoverPhotoSyncWorker.perform_async(id)
  end
end
