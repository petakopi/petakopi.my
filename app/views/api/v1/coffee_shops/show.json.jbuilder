json.cache! ["v1", "coffee_shop", @coffee_shop.slug], expires_in: 12.hour do
  json.extract!(
    @coffee_shop,
    :name,
    :slug,
    :lat,
    :lng,
  )
  json.url main_coffee_shop_url(id: @coffee_shop.slug)
end
