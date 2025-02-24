class MoveGoogleLocationToCoffeeShops < ActiveRecord::Migration[8.0]
  def change
    add_column :coffee_shops, :location, :st_point, geographic: true
    add_index :coffee_shops, :location, using: :gist

    # Add google_place_id column
    add_column :coffee_shops, :google_place_id, :string
  end
end
