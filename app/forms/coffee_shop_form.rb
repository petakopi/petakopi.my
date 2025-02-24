class CoffeeShopForm < CoffeeShop
  before_validation :set_location

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
end
