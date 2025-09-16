class DropGoogleLocations < ActiveRecord::Migration[8.0]
  def change
    drop_table :google_locations, if_exists: true
  end
end
