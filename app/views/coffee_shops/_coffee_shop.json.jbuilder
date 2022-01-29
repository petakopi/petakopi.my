json.extract! coffee_shop, :id, :name, :district, :state, :urls, :status, :created_at, :updated_at
json.url coffee_shop_url(coffee_shop, format: :json)
