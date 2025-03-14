class CoverPhotoProcessor
  include Callable

  def initialize(coffee_shop:)
    @coffee_shop = coffee_shop
  end

  def call
    return false unless valid?

    Rails.logger.info("Reattaching logo for coffee shop ##{coffee_shop.id}")
    reattach
    coffee_shop.touch # Bust any caches
    true
  end

  private

  attr_reader :coffee_shop

  def valid?
    return true if coffee_shop.logo.attached?

    Rails.logger.info("No logo attached for coffee shop ##{coffee_shop.id}")
    false
  end

  def reattach
    blob = coffee_shop.logo.blob

    Rails.logger.info("Reattaching logo with new name for coffee shop ##{coffee_shop.id}")

    coffee_shop.logo.attach(
      io: blob.open,
      filename: file_name,
      content_type: coffee_shop.logo.content_type,
      key: generate_key
    )
  end

  def file_name
    "#{coffee_shop.id}-#{Time.current.to_i}#{file_extension}"
  end

  def file_extension
    logo = coffee_shop.logo
    ext = File.extname(logo.filename.to_s)
    ext.presence || ".#{logo.content_type.split("/").last}"
  end

  def generate_key
    "images/cover-photo/#{file_name}"
  end
end
