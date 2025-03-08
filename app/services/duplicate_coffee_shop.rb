class DuplicateCoffeeShop
  include Callable

  def initialize(coffee_shop:)
    @coffee_shop = coffee_shop
  end

  def call
    dup = coffee_shop.dup

    dup.uuid = nil
    dup.status = "unpublished"
    dup.approved_at = nil
    dup.admin_notes = "Duplicate of #{coffee_shop.id}"
    dup.tags << coffee_shop.tags
    dup.logo.attach(
      io: StringIO.new(coffee_shop.logo.download),
      filename: coffee_shop.logo.filename,
      content_type: coffee_shop.logo.content_type
    )
    dup.save!

    dup
  end

  private

  attr_reader :coffee_shop
end
