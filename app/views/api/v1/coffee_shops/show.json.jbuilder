json.status "success"
json.data do
  json.coffee_shop do
    json.partial! "api/v1/coffee_shops/coffee_shop", coffee_shop: @coffee_shop
  end
end
