class DropGoogleLocationDetailsColumns < ActiveRecord::Migration[8.0]
  def change
    remove_column :google_locations, :locality, :string
    remove_column :google_locations, :administrative_area_level_1, :string
    remove_column :google_locations, :administrative_area_level_2, :string
    remove_column :google_locations, :postal_code, :string
    remove_column :google_locations, :country, :string
  end
end
