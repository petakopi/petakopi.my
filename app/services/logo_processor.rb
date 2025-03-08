require "open-uri"
require "tempfile"

# LogoProcessor handles image processing for coffee shop logos
# It resizes, optimizes, and potentially compresses images to ensure
# they meet size and quality requirements
class LogoProcessor
  include Callable

  ACCEPTABLE_FILE_SIZE = 20_000 # 20KB
  MAX_WIDTH = 512

  def initialize(coffee_shop:)
    @coffee_shop = coffee_shop
    @temp_files = []
  end

  def call
    return unless valid?

    Rails.logger.info("Processing logo for coffee shop ##{coffee_shop.id}")

    begin
      process
      reattach
      true
    rescue => e
      Rails.logger.error("Logo processing failed: #{e.message}")
      false
    ensure
      cleanup
    end
  end

  private

  attr_reader :coffee_shop, :temp_files

  def valid?
    return true if coffee_shop.logo.attached?

    Rails.logger.info("No logo attached for coffee shop ##{coffee_shop.id}")
    false
  end

  def process
    input_file = create_temp_file("original")
    output_file = create_temp_file("processed")

    # Download the original image
    blob = coffee_shop.logo.blob
    File.binwrite(input_file.path, blob.download)

    # Resize the image
    Rails.logger.info("Resizing logo to max width #{MAX_WIDTH}px")
    ImageProcessing::Vips
      .source(input_file.path)
      .resize_to_limit(MAX_WIDTH, nil)
      .call(destination: output_file.path)

    # Optimize the image
    Rails.logger.info("Optimizing logo image")
    ImageOptim.new.optimize_image!(output_file.path)

    # Compress with TinyPNG if still too large
    if File.size(output_file.path) > ACCEPTABLE_FILE_SIZE
      Rails.logger.info("Logo still too large (#{File.size(output_file.path)} bytes), compressing with TinyPNG")
      source = Tinify.from_file(output_file.path)
      source.to_file(output_file.path)
    end

    @processed_file = output_file
  end

  def reattach
    Rails.logger.info("Reattaching processed logo to coffee shop ##{coffee_shop.id}")
    coffee_shop.logo.attach(
      io: File.open(@processed_file.path),
      filename: generate_filename,
      content_type: coffee_shop.logo.content_type
    )

    # Bust any caches
    coffee_shop.touch
  end

  def cleanup
    Rails.logger.info("Cleaning up temporary files")
    @temp_files.each do |file|
      file.close
      file.unlink if file.respond_to?(:unlink) && File.exist?(file.path)
    rescue => e
      Rails.logger.warn("Failed to clean up temp file: #{e.message}")
    end
  end

  def create_temp_file(prefix)
    file = Tempfile.new([prefix, file_extension])
    @temp_files << file
    file
  end

  def generate_filename
    "#{coffee_shop.id}-#{Time.current.to_i}#{file_extension}"
  end

  def file_extension
    logo = coffee_shop.logo
    ext = File.extname(logo.filename.to_s)

    return ext if ext.present?

    ".#{logo.content_type.split("/")[1]}"
  end
end
