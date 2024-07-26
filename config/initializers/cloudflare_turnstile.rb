unless Rails.env.test?
  RailsCloudflareTurnstile.configure do |c|
    c.site_key = Rails.application.credentials.dig(:cloudflare, :turnstile, :site_key)
    c.secret_key = Rails.application.credentials.dig(:cloudflare, :turnstile, :secret_key)
    c.fail_open = true
  end
end

