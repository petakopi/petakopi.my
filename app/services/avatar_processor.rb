require "open-uri"

# TODO: Duplicate, Merge with LogoProcessor
class AvatarProcessor
  include Callable

  ACCEPTABLE_FILE_SIZE = 100_000

  def initialize(user:)
    @user = user
  end

  def call
    return unless valid?

    process
    reattach
    cleanup
  end

  private

  attr_reader :user

  def valid?
    user.avatar.attached?
  end

  def process
    input = "#{path}original-#{file_name}"
    output = "#{path}#{file_name}"

    IO.copy_stream(URI.parse(user.avatar.url).open, input)

    ImageProcessing::Vips
      .source(input)
      .resize_to_limit(512, nil)
      .call(destination: output)

    ImageOptim.new.optimize_image!(output)

    return if File.size(output) <= ACCEPTABLE_FILE_SIZE

    source = Tinify.from_file(output)
    source.to_file(output)
  end

  def reattach
    user.avatar.attach(
      io: File.open("#{path}#{file_name}"),
      filename: file_name.to_s
    )
  end

  def cleanup
    File.delete("#{path}#{file_name}")
    File.delete("#{path}original-#{file_name}")

    user.touch # bust the cache if there's any
  end

  def file_name
    @file_name ||=
      begin
        id = user.id
        random_chars = Time.current.to_i

        "#{id}-avatar-#{random_chars}#{file_extension}"
      end
  end

  def file_extension
    avatar = user.avatar
    ext = File.extname(avatar.filename.to_s)

    return ext if ext.present?

    ".#{avatar.content_type.split("/")[1]}"
  end

  def path
    "/tmp/"
  end
end
