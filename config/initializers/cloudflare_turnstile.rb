RailsCloudflareTurnstile.configure do |c|
  # Ref: https://developers.cloudflare.com/turnstile/troubleshooting/testing/
  if Rails.env.production?
    c.site_key = Rails.application.credentials.dig(:cloudflare, :turnstile, :site_key)
    c.secret_key = Rails.application.credentials.dig(:cloudflare, :turnstile, :secret_key)
  else
    c.site_key = "1x00000000000000000000AA"
    c.secret_key = "1x0000000000000000000000000000000AA"
  end

  c.theme = :light
  c.fail_open = true
  c.enabled = Rails.application.credentials.dig(:cloudflare, :turnstile, :site_key).present?
end

module RailsCloudflareTurnstileTurboPatch
  def cloudflare_turnstile_script_tag(async: true, defer: true)
    super.sub("></script>", " data-turbo-track=\"reload\" data-turbo-temporary=\"true\"></script>").html_safe
  end
end

RailsCloudflareTurnstile::ViewHelpers.prepend(RailsCloudflareTurnstileTurboPatch)
