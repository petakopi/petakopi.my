class AddCoffeeShopStatusDefault < ActiveRecord::Migration[7.0]
  def change
    change_column_default :coffee_shops, :status, default: false, from: "", to: 0
  end
end
