class DropLocationColumnsOnCoffeeShops < ActiveRecord::Migration[7.1]
  def change
    remove_column :coffee_shops, :lat, :string
    remove_column :coffee_shops, :lng, :string
    remove_column :coffee_shops, :google_place_id, :string
    remove_column :coffee_shops, :state, :string
    remove_column :coffee_shops, :district, :string
  end
end
