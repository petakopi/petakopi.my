class LogoAttacher
  include Callable

  def initialize(coffee_shop:, logo_url:)
    @coffee_shop = coffee_shop
    @logo_url = logo_url
  end

  def call
    file = Down.download(logo_url)

    coffee_shop.logo.attach(io: file, filename: file.original_filename)
  end

  private

  attr_reader :coffee_shop, :logo_url
end
