class CoffeeShopCreatorForm < YAAF::Form
  attr_accessor :coffee_shop_attributes

  def initialize(attributes)
    super(attributes)

    @models = [coffee_shop]
  end

  def coffee_shop
    @coffee_shop ||= CoffeeShop.new(coffee_shop_attributes)
  end
end
