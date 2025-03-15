json.extract!(
  coffee_shop,
  :uuid,
  :slug,
  :name
)
json.links coffee_shop.links
json.lat coffee_shop.lat
json.lng coffee_shop.lng
json.district coffee_shop.district
json.state coffee_shop.state
json.url main_coffee_shop_url(id: coffee_shop.slug)
json.logo optimized_blob_url(asset: coffee_shop.logo, options: ["width=200"])
json.cover_photo optimized_blob_url(asset: coffee_shop.cover_photo, options: ["width=400"])
json.updated_at coffee_shop.updated_at

# Include distance if it was calculated (for nearby coffee shops)
if @include_distance && coffee_shop.respond_to?(:distance_in_km)
  json.distance_in_km coffee_shop.distance_in_km.round(1)
end
