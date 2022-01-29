class AddCoffeeShopUrlsDefault < ActiveRecord::Migration[7.0]
  def change
    change_column_default :coffee_shops, :urls, from: "", to: {}
  end
end
