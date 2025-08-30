json.status "success"

json.data do
  json.default_center do
    json.lat @default_center[:lat]
    json.lng @default_center[:lng]
  end

  json.geojson do
    json.type "FeatureCollection"

    json.features @coffee_shops do |shop|
      json.type "Feature"
      json.geometry do
        json.type "Point"
        json.coordinates [shop.lng.to_f, shop.lat.to_f]
      end
      json.properties do
        json.uuid shop.uuid
        json.name shop.name
        json.slug shop.slug
        json.url main_coffee_shop_url(id: shop.slug)
        json.logo shop.logo.attached? ? optimized_blob_url(asset: shop.logo, options: ["width=200"]) : nil
        json.cover_photo shop.cover_photo.attached? ? optimized_blob_url(asset: shop.cover_photo, options: ["width=600"]) : nil
        json.rating shop.rating
        json.rating_count shop.rating_count
      end
    end
  end
end
