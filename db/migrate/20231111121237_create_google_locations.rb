class CreateGoogleLocations < ActiveRecord::Migration[7.1]
  def change
    create_table :google_locations do |t|
      t.references :coffee_shop, null: false, foreign_key: true
      t.string :place_id
      t.string :lat
      t.string :lng
      t.string :locality
      t.string :administrative_area_level_1
      t.string :administrative_area_level_2
      t.string :postal_code
      t.string :country

      t.timestamps
    end
  end
end
