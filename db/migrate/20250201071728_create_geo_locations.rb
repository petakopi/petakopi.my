class CreateGeoLocations < ActiveRecord::Migration[7.2]
  def change
    create_table :geo_locations do |t|
      t.string :name, null: false
      t.string :kind, null: false
      t.geometry :geom, null: false
      t.timestamps
    end

    add_index :geo_locations, [:name, :kind]
    add_index :geo_locations, :geom, using: :gist
  end
end
