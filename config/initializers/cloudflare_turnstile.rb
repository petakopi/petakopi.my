RailsCloudflareTurnstile.configure do |c|
  c.enabled = Rails.application.credentials.dig(:cloudflare, :turnstile, :site_key).present?
  c.site_key = Rails.application.credentials.dig(:cloudflare, :turnstile, :site_key)
  c.secret_key = Rails.application.credentials.dig(:cloudflare, :turnstile, :secret_key)
  c.fail_open = true
end

module RailsCloudflareTurnstileTurboPatch
  def cloudflare_turnstile_script_tag(async: true, defer: true)
    super.sub("></script>", " data-turbo-track=\"reload\" data-turbo-temporary=\"true\"></script>").html_safe
  end
end

RailsCloudflareTurnstile::ViewHelpers.prepend(RailsCloudflareTurnstileTurboPatch)
