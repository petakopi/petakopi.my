module CoffeeShopDecorator
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

    "https://www.tiktok.com/#{twitter}"
  end

  def whatsapp_url
    return if whatsapp.blank?

    "https://wa.me/#{whatsapp}"
  end

  def location_full_url
    css_class = "text-brown-600 hover:text-brown-900"

    state_param = state&.parameterize
    district_param = district&.parameterize

    district_link =
      link_to district, directories_path(state: state_param, district: district_param), class: css_class
    state_link =
      link_to state, directories_path(state: state_param), class: css_class

    raw "#{district_link}, #{state_link}"
  end
end
