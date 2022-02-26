json.extract! coffee_shop, :id, :name, :slug, :lat, :lng
json.logo rails_public_blob_url(coffee_shop.logo)
json.url coffee_shop_url(coffee_shop)
