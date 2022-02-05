class RemoveUniqueIndexForNameInCoffeeShops < ActiveRecord::Migration[7.0]
  def change
    remove_index :coffee_shops, :name, name: "index_coffee_shops_on_name", unique: true
  end
end
