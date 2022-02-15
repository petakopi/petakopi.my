class LogoProcessor
  include Callable

  def initialize(coffee_shop:)
    @coffee_shop = coffee_shop
  end

  def call
    compress
    reattach
    cleanup
  end

  private

  attr_reader :coffee_shop

  def compress
    source = Tinify.from_url(coffee_shop.logo.url)
    source.to_file("#{path}#{file_name}")
  end

  def reattach
    coffee_shop.logo.attach(io: File.open("#{path}#{file_name}"), filename: "#{file_name}")
  end

  def cleanup
    File.delete("#{path}#{file_name}")
  end

  def file_name
    @file_name ||=
      begin
        id = coffee_shop.id
        random_chars = Time.current.to_i
        file_extension = File.extname(coffee_shop.logo.filename.to_s)

        "#{id}-#{random_chars}"
      end
  end

  def path
    "/tmp/"
  end
end
