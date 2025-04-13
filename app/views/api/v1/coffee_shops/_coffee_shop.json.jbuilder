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
json.rating coffee_shop.rating
json.rating_count ActiveSupport::NumberHelper.number_to_delimited(coffee_shop.rating_count)
json.updated_at coffee_shop.updated_at
if coffee_shop.district && coffee_shop.state
  json.district_url directories_path(state: coffee_shop.state.parameterize, district: coffee_shop.district.parameterize)
  json.state_url directories_path(state: coffee_shop.state.parameterize)
else
  json.district_url nil
  json.state_url nil
end
json.has_owner coffee_shop.owners.size.positive?

# Include distance if it was calculated (for nearby coffee shops)
if @include_distance && coffee_shop.respond_to?(:distance_in_km)
  json.distance_in_km coffee_shop.distance_in_km.round(1)
end
