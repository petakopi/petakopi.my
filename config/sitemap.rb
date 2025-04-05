# Set the host name for URL creation
SitemapGenerator::Sitemap.default_host = "https://petakopi.my"

SitemapGenerator::Sitemap.create do
  # Coffee Shops
  CoffeeShop.status_published.find_each do |coffee_shop|
    add main_coffee_shop_path(id: coffee_shop.slug), lastmod: coffee_shop.updated_at
  end

  # States
  CoffeeShop.status_published.distinct.select(:state).where.not(state: nil).each do |state|
    add directories_path(state: state.state.parameterize), lastmod: Time.current
  end

  # Districts
  CoffeeShop.status_published.distinct.select(:district).where.not(district: nil).each do |district|
  end

  CoffeeShop
    .status_published
    .where.not(district: nil)
    .where.not(state: nil)
    .group(:state, :district)
    .order(:state, :district)
    .select(:state, :district).each do |location|
    add(
      directories_path(
        state: location.state.parameterize,
        district: location.district.parameterize
      ),
      lastmod: Time.current
    )
  end
end
