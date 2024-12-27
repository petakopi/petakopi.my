json.extract!(
  coffee_shop,
  :uuid,
  :slug,
  :name
)
json.links coffee_shop.urls.compact_blank do |name, url|
  json.name name
  json.url url
end
json.lat coffee_shop.google_location.lat
json.lng coffee_shop.google_location.lng
json.district coffee_shop.google_location.locality
json.state coffee_shop.google_location.administrative_area_level_1
json.url main_coffee_shop_url(id: coffee_shop.slug)
json.logo rails_public_blob_url(coffee_shop.logo)
json.updated_at coffee_shop.updated_at
