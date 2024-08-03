class ConvertLatitudeAndLongitudeToFloat < ActiveRecord::Migration[7.1]
  def up
    change_column :google_locations, :lat, :float, using: "lat::float"
    change_column :google_locations, :lng, :float, using: "lng::float"
  end

  def down
    change_column :google_locations, :lat, :string
    change_column :google_locations, :lng, :string
  end
end
