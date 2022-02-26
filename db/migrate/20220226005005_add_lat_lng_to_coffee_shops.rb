class AddLatLngToCoffeeShops < ActiveRecord::Migration[7.0]
  def change
    add_column :coffee_shops, :lat, :string
    add_column :coffee_shops, :lng, :string
  end
end
