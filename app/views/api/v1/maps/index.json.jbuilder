json.status "success"
json.data do
  json.coffee_shops do
    json.array!(@coffee_shops) do |coffee_shop|
      json.extract!(
        coffee_shop,
        :uuid,
        :name
      )
      json.lat coffee_shop.google_location.lat
      json.lng coffee_shop.google_location.lng
      json.logo rails_public_blob_url(coffee_shop.logo)
      json.updated_at coffee_shop.updated_at
    end
  end
end
