class ReportForm
  include ActiveModel::Model
  include ActiveModel::Attributes

  attribute :coffee_shop_id, :string
  attribute :email, :string
  attribute :message, :string

  validates :coffee_shop_id, presence: true
  validates :message, presence: true, length: {minimum: 10, maximum: 1000}
  validates :email, format: {with: URI::MailTo::EMAIL_REGEXP, allow_blank: true}

  validate :coffee_shop_exists

  attr_reader :coffee_shop

  def submit
    # Run validations first
    return false unless valid?

    @coffee_shop = find_coffee_shop

    # Check if coffee shop exists ONLY if coffee_shop_id is present
    if coffee_shop_id.present? && @coffee_shop.blank?
      errors.add(:coffee_shop_id, "not found")
      return false
    end

    message_content = build_report_message
    TelegramNotifierWorker.perform_async(message_content)
    true
  end

  def not_found_error?
    coffee_shop_id.present? && @coffee_shop.blank? && errors[:coffee_shop_id].include?("not found")
  end

  private

  def coffee_shop_exists
    # Only run during normal validation, not when checking for not found
    return unless coffee_shop_id.present?

    @coffee_shop = find_coffee_shop
    return if @coffee_shop.blank?

    if @coffee_shop.status_closed?
      errors.add(:base, "Cannot report on closed coffee shops")
    end
  end

  def find_coffee_shop
    CoffeeShop.find_by(uuid: coffee_shop_id) ||
      CoffeeShop.find_by(slug: coffee_shop_id) ||
      CoffeeShop.find_by(id: coffee_shop_id)
  end

  def build_report_message
    [
      "Coffee Shop ID: #{@coffee_shop.id}",
      "Coffee Shop Name: #{@coffee_shop.name}",
      "Coffee Shop UUID: #{@coffee_shop.uuid}",
      "Email: #{email.presence || "N/A"}",
      "Report: #{message}",
      "Submitted at: #{Time.current}",
      "Source: Mobile App"
    ].join("\n")
  end
end

