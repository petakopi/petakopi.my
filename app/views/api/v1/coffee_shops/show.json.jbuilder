json.extract!(
  @coffee_shop,
  :name,
  :slug,
  :lat,
  :lng
)
json.logo_url rails_public_blob_url(@coffee_shop.logo)
json.url main_coffee_shop_url(id: @coffee_shop.slug)
json.tags @coffee_shop.tags.map(&:name).sort
json.links do
  json.array! @links
end
