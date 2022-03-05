# Set the host name for URL creation
SitemapGenerator::Sitemap.default_host = "https://petakopi.my"

SitemapGenerator::Sitemap.create do
  CoffeeShop.status_published.find_each do |coffee_shop|
    add coffee_shop_path(id: coffee_shop.slug), lastmod: coffee_shop.updated_at
  end
end
