json.cache! @cache_key, expires_in: 1.hour, skip_digest: true do
  json.type "FeatureCollection"
  json.features do
    json.array!(@coffee_shops) do |coffee_shop|
      json.type "Feature"
      json.properties do
        json.name coffee_shop.name
        json.url main_coffee_shop_url(id: coffee_shop.slug)
        json.logo rails_public_blob_url(coffee_shop.logo)
      end

      json.geometry do
        json.type "Point"
        json.coordinates do
          json.array!([coffee_shop.lng, coffee_shop.lat])
        end
      end
    end
  end
end
