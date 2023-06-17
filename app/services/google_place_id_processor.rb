require "open-uri"
require "nokogiri"

class GooglePlaceIdProcessor
  include Callable

  def initialize(coffee_shop:)
    @coffee_shop = coffee_shop
  end

  def call
    return if invalid?

    get_place_id
    save
  end

  private

  def invalid?
    @coffee_shop.google_map.blank?
  end

  def html
    @html ||= URI.open(@coffee_shop.google_map)
  end

  def doc
    @doc ||= Nokogiri::HTML(html)
  end

  def script
    @script ||=
      doc
        .search("script")
        .find do |elem|
          elem.text.match /window.APP_OPTIONS/
        end
  end

  def get_place_id
    @place_id =
      script
        .text
        .scan(/"ChI[^"]*"/)
        .map do |str|
          str.gsub(/[^a-zA-Z0-9_-]/, '')
        end
          .uniq
          .first
  end

  def save
    return if @place_id.blank?

    @coffee_shop.update(google_place_id: @place_id)
  end
end
