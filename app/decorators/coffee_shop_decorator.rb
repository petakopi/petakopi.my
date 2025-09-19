module CoffeeShopDecorator
  def links
    [
      {name: "Facebook", url: facebook_url},
      {name: "Instagram", url: instagram_url},
      {name: "Twitter", url: twitter_url},
      {name: "TikTok", url: tiktok_url},
      {name: "WhatsApp", url: whatsapp_url},
      {name: "Google", url: google_map}
    ].reject { |link| link[:url].blank? }
  end

  def facebook_url
    return if facebook.blank?

    "https://www.facebook.com/#{facebook}"
  end

  def instagram_url
    return if instagram.blank?

    "https://www.instagram.com/#{instagram}"
  end

  def twitter_url
    return if twitter.blank?

    "https://www.twitter.com/#{twitter}"
  end

  def tiktok_url
    return if tiktok.blank?

    "https://www.tiktok.com/#{tiktok}"
  end

  def whatsapp_url
    return if whatsapp.blank?

    "https://wa.me/#{whatsapp}"
  end

  def location_full_url
    css_class = "text-brown-600 hover:text-brown-900"

    state_param = state&.parameterize
    district_param = district&.parameterize

    return "" if state_param.blank? || district_param.blank?

    district_link =
      link_to district,
        directories_path(state: state_param, district: district_param), class: css_class
    state_link =
      link_to state,
        directories_path(state: state_param), class: css_class

    raw "#{district_link}, #{state_link}"
  end

  def today_hours
    @today_hours ||= begin
      current_day = Time.current.wday
      opening_hours.select do |h|
        h.start_day == current_day
      end.sort_by(&:start_time)
    end
  end

  def is_closed_today?
    return true if today_hours.empty?

    # Check if all periods are marked as closed
    today_hours.all? do |hours|
      start_time = hours.start_time_formatted.to_s.downcase
      close_time = hours.close_time_formatted.to_s.downcase

      # Check for explicit closed indicators
      closed_indicators = ["-", "closed", "not open", "n/a", ""]
      closed_indicators.any? { |indicator| start_time == indicator || close_time == indicator }
    end
  end

  def is_open?
    return false if is_closed_today?

    current_time = Time.current.strftime("%H%M").to_i

    # Check if current time falls within any of today's opening periods
    today_hours.any? do |hours|
      current_time.between?(hours.start_time, hours.close_time)
    end
  end

  def open_status
    if is_closed_today?
      {
        text: "Closed today",
        classes: "bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20"
      }
    else
      {
        text: is_open? ? "Open" : "Closed",
        classes: is_open? ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20" : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"
      }
    end
  end

  def today_hours_display
    return if is_closed_today?

    # Join all opening periods with a comma
    today_hours.map do |hours|
      "#{hours.start_time_formatted} - #{hours.close_time_formatted}"
    end.join(", ")
  end
end
