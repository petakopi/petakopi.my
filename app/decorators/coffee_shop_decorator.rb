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
end
