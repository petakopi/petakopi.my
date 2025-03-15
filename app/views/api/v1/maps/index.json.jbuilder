json.cache! @cache_key, expires_in: 1.hour, skip_digest: true do
  json.status "success"

  json.data do
    json.coffee_shops @coffee_shops do |shop|
      json.extract! shop, :id, :name, :slug, :lat, :lng
      # Exclude created_at and updated_at
      # Add any other attributes you want to include

      json.logo_url shop.logo.attached? ? optimized_blob_url(asset: shop.logo, options: ["width=200"]) : nil
      json.cover_photo_url shop.cover_photo.attached? ? optimized_blob_url(asset: shop.cover_photo, options: ["width=600"]) : nil
    end

    json.geojson do
      json.type "FeatureCollection"

      json.features @coffee_shops.map do |shop|
        if shop.lat.present? && shop.lng.present?
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [shop.lng.to_f, shop.lat.to_f]
            },
            properties: {
              id: shop.id,
              name: shop.name,
              slug: shop.slug,
              logo: shop.logo.attached? ? optimized_blob_url(asset: shop.logo, options: ["width=200"]) : nil,
              cover_photo: shop.cover_photo.attached? ? optimized_blob_url(asset: shop.cover_photo, options: ["width=600"]) : nil
            }
          }
        end
      end.compact
    end
  end
end
