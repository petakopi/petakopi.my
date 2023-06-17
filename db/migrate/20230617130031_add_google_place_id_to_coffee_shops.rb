class AddGooglePlaceIdToCoffeeShops < ActiveRecord::Migration[7.0]
  def change
    add_column :coffee_shops, :google_place_id, :string
  end
end
