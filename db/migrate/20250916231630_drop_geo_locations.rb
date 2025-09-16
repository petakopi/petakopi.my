class DropGeoLocations < ActiveRecord::Migration[8.0]
  def change
    drop_table :geo_locations, if_exists: true
  end
end
