require "open-uri"
require "nokogiri"

class GoogleApis::PlaceId::Process < Micro::Case
  attributes :coffee_shop
  attributes :google_place_id

  def call!
    if coffee_shop.google_location.place_id.present?
      return Success result: {coffee_shop: coffee_shop}
    end

    unless valid?
      return Failure result: {
        coffee_shop: coffee_shop,
        msg: "Missing Google Map URL"
      }
    end

    get_google_place_id
    save

    Success result: {coffee_shop: coffee_shop}
  end

  private

  def valid?
    coffee_shop.google_map.present?
  end

  def script
    @script ||=
      Nokogiri::HTML(URI.parse(@coffee_shop.google_map).open)
        .search("script")
        .find do |elem|
          elem.text.match(/window.APP_OPTIONS/)
        end
  end

  def get_google_place_id
    @google_place_id =
      script
        .text
        .scan(/"ChI[^"]*"/)
        .map do |str|
          str.gsub(/[^a-zA-Z0-9_-]/, "")
        end
        .uniq
        .first
  end

  def save
    coffee_shop.update(google_place_id: @google_place_id)
  end
end
