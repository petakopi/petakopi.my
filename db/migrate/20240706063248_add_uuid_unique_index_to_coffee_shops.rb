class AddUuidUniqueIndexToCoffeeShops < ActiveRecord::Migration[7.1]
  def change
    add_index :coffee_shops, :uuid, unique: true
  end
end
