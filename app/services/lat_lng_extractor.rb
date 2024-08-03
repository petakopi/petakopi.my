# This should be extracted into different classes, but 🤷
class LatLngExtractor
  include Callable

  def initialize(url:)
    @url = url
  end

  def call
    return unless valid?

    if url.starts_with?("https://goo.gl/maps/")
      extract_using_redirection
    elsif url.starts_with?("https://www.google.com/maps/place/")
      extract_using_redirection
    elsif url.starts_with?("https://g.page/")
      extract_using_cid
    elsif url.starts_with?("https://maps.app.goo.gl/")
      extract_using_cid
    end
  end

  private

  attr_reader :url, :cid

  def valid?
    url.present?
  end

  def google_map_api_key
    ENV.fetch("GOOGLE_API_KEY_API")
  end

  def extract_using_redirection
    # E.g: https://goo.gl/maps/HCA7pq73Ze1HwEMW8

    response = Net::HTTP.get_response(URI.parse(url))

    next_url =
      if response.is_a?(Net::HTTPRedirection)
        response["location"]
      else
        url
      end

    return if next_url.nil?

    begin
      output =
        next_url
          .match(/!3d\d+\.\d+!4d\d+\.\d+/)
          .to_s
          .gsub(/^!3d/, "")
          .split("!4d")
    rescue NoMethodError
    end

    return output if output.present?

    # E.g: https://maps.google.com?q=KopyJam,+38,+Jalan+Padi,+Bandar+Baru+Uda,+81200+Johor+Bahru,+Johor&ftid=0x31da73d449041aa9:0x3e0b4f6468c9ac4d&hl=en-US&gl=us&entry=gps&lucs=s2se,a1&shorturl=1

    uri = URI.parse(next_url)
    params = CGI.parse(uri.query)

    if params["ftid"].present?
      @cid =
        params["ftid"]
          .first
          .split(":")
          .last.to_i(16)

      convert_cid_to_pos
    else
      params["q"].first.split(",")
    end
  end

  def extract_using_cid
    # E.g: https://g.page/BrewnBread

    page_url = url
    call_count = 0

    begin
      break if call_count == 2

      response = Net::HTTP.get_response(URI.parse(page_url))
      page_url = response["location"] if response["location"].present?

      call_count += 1
    end while response.is_a?(Net::HTTPRedirection)

    @cid =
      page_url
        .match(/:0x.*\?/)
        .to_s
        .delete(":")
        .delete("?")
        .to_i(16)

    if cid == 0
      extract_using_redirection
    else
      convert_cid_to_pos
    end
  end

  def convert_cid_to_pos
    api_url = "https://maps.googleapis.com/maps/api/place/details/json?cid=#{cid}&key=#{google_map_api_key}"

    response = Net::HTTP.get_response(URI.parse(api_url))

    return unless response.is_a?(Net::HTTPOK)

    result = JSON.parse(response.body)

    raise result["error_message"] if result["status"] != "OK"

    result
      .dig("result", "geometry", "location")
      .values
      .map(&:to_s)
  end
end
