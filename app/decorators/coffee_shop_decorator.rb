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

    "https://www.tiktok.com/#{tiktok}"
  end

  def whatsapp_url
    return if whatsapp.blank?

    "https://wa.me/#{whatsapp}"
  end

  def location_full_url
    css_class = "text-brown-600 hover:text-brown-900"

    state_param = google_location.state&.parameterize
    district_param = google_location.district&.parameterize

    return "" if state_param.blank? || district_param.blank?

    district_link =
      link_to google_location.district,
        directories_path(state: state_param, district: district_param), class: css_class
    state_link =
      link_to google_location.state,
        directories_path(state: state_param),class: css_class

    raw "#{district_link}, #{state_link}"
  end

  def check_ins
    last_7_days_check_ins =
      CheckIn.includes(:user).where(created_at: 7.days.ago.., coffee_shop: self)

    {
      count:
        last_7_days_check_ins.count,
      users:
        last_7_days_check_ins
          .order(created_at: :desc)
          .limit(4)
          .map(&:user)
          .uniq { |u| u.id }
    }
  end
end
