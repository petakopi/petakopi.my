class LogoProcessor
  include Callable

  def initialize(coffee_shop:)
    @coffee_shop = coffee_shop
  end

  def call
    return unless valid?

    process
    reattach
    cleanup
  end

  private

  attr_reader :coffee_shop

  def valid?
    coffee_shop.logo.attached?
  end

  def process
    IO.copy_stream(URI.open(coffee_shop.logo.url), "#{path}original-#{file_name}")

    ImageProcessing::Vips
      .source("#{path}original-#{file_name}")
      .resize_to_limit(512, nil)
      .call(destination: "#{path}#{file_name}")

    ImageOptim.new.optimize_image!("#{path}#{file_name}")
  end

  def reattach
    coffee_shop.logo.attach(
      io: File.open("#{path}#{file_name}"),
      filename: "#{file_name}"
    )
  end

  def cleanup
    File.delete("#{path}#{file_name}")
    File.delete("#{path}original-#{file_name}")

    coffee_shop.touch # bust the cache if there's any
  end

  def file_name
    @file_name ||=
      begin
        id = coffee_shop.id
        random_chars = Time.current.to_i

        "#{id}-#{random_chars}#{file_extension}"
      end
  end

  def file_extension
    logo = coffee_shop.logo
    ext = File.extname(logo.filename.to_s)

    return ext if ext.present?

    ".#{logo.content_type.split("/")[1]}"
  end

  def path
    "/tmp/"
  end
end
