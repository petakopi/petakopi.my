class AddCoffeeShopStatusNull < ActiveRecord::Migration[7.0]
  def change
    change_column_null :coffee_shops, :status, false
  end
end
