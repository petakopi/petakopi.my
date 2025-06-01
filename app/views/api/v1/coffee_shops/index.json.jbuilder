json.status "success"
json.data do
  json.pages do
    json.current_page @page.current_page
    json.total_pages @page.total_pages
    json.total_count @page.total_count
    json.is_empty @page.empty?
  end
  json.coffee_shops do
    json.array!(@page.records) do |coffee_shop|
      json.partial! "api/v1/coffee_shops/coffee_shop", coffee_shop: coffee_shop
    end
  end
end
