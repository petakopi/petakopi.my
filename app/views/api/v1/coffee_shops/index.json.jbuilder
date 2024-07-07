json.status "success"
json.data do
  json.pages do
    json.previous_cursor @page.previous_cursor
    json.next_cursor @page.next_cursor
    json.has_previous @page.has_previous?
    json.has_next @page.has_next?
    json.is_empty @page.empty?
  end
  json.coffee_shops do
    json.array!(@page.records) do |coffee_shop|
      json.partial! "api/v1/coffee_shops/coffee_shop", coffee_shop: coffee_shop
    end
  end
end
