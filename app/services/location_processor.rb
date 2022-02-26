class LocationProcessor
  include Callable

  def initialize(coffee_shop:)
    @coffee_shop = coffee_shop
  end

  def call
    return unless valid?

    process
    save
  end

  private

  attr_reader :coffee_shop, :lat, :lng

  def valid?
    coffee_shop.google_map.present? && coffee_shop.status_published?
  end

  def process
    @lat, @lng = LatLngExtractor.call(url: coffee_shop.google_map)
  end

  def save
    return if lat.nil? || lng.nil?

    coffee_shop.update(lat: lat, lng: lng)
  end
end
