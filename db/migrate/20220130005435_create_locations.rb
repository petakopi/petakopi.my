class CreateLocations < ActiveRecord::Migration[7.0]
  def change
    create_table :locations do |t|
      t.string :country
      t.string :state
      t.string :city
      t.string :postcode

      t.timestamps
    end
  end
end
