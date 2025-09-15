class CoffeeShopForm < CoffeeShop
  after_initialize :ensure_urls_initialized
  before_validation :set_location
  before_validation :set_defaults, on: :create
  validate :check_for_duplicate_coffee_shop, on: :create

  validates :name, presence: true, length: {minimum: 3}

  attr_accessor :tmp_lat, :tmp_lng

  def self.model_name
    CoffeeShop.model_name
  end

  def lat
    location&.y
  end

  def lng
    location&.x
  end

  private

  def set_location
    return if tmp_lat.blank? || tmp_lng.blank?

    self.location = "POINT(#{tmp_lng} #{tmp_lat})"
  end

  def ensure_urls_initialized
    self.urls = {} if urls.nil?
  end

  def set_defaults
    # Also populate the store accessor fields
    self.facebook ||= ""
    self.instagram ||= ""
    self.tiktok ||= ""
    self.twitter ||= ""
    self.whatsapp ||= ""
  end

  def check_for_duplicate_coffee_shop
    return unless should_check_for_duplicates?

    duplicate = duplicate_by_google_place_id || duplicate_by_location
    if duplicate.present?
      coffee_shop_url = Rails.application.routes.url_helpers.main_coffee_shop_url(id: duplicate.slug, host: "petakopi.my")
      errors.add(:base, "This coffee shop already exists on our platform. Please check if it's the same one: <a href='#{coffee_shop_url}' target='_blank' class='underline text-brown-600 hover:text-brown-800'>#{duplicate.name}</a>".html_safe)
    end
  end

  def should_check_for_duplicates?
    google_place_id.present? || location.present?
  end

  def duplicate_by_google_place_id
    return nil if google_place_id.blank?

    @duplicate_by_google_place_id ||= CoffeeShop
      .status_published
      .where(google_place_id: google_place_id)
      .where.not(id: id)
      .first
  end

  def duplicate_by_location
    return nil if location.blank?

    # Check for published coffee shops within 10 meters (approximately same location)
    @duplicate_by_location ||= CoffeeShop
      .status_published
      .where("ST_DWithin(location::geography, ?::geography, ?)", location, 10)
      .where.not(id: id)
      .first
  end
end
