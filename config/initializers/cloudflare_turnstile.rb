RailsCloudflareTurnstile.configure do |c|
  # Ref: https://developers.cloudflare.com/turnstile/troubleshooting/testing/
  c.site_key = ENV["CLOUDFLARE_TURNSTILE_SITE_KEY"]
  c.secret_key = ENV["CLOUDFLARE_TURNSTILE_SECRET_KEY"]

  c.theme = :light
  c.fail_open = true
  c.enabled = ENV["CLOUDFLARE_TURNSTILE_SITE_KEY"].present? && ENV["CLOUDFLARE_TURNSTILE_SECRET_KEY"].present?
end

module RailsCloudflareTurnstileTurboPatch
  def cloudflare_turnstile_script_tag(async: true, defer: true)
    super.sub("></script>", " data-turbo-track=\"reload\" data-turbo-temporary=\"true\"></script>").html_safe
  end
end

RailsCloudflareTurnstile::ViewHelpers.prepend(RailsCloudflareTurnstileTurboPatch)
