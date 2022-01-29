class CreateCoffeeShops < ActiveRecord::Migration[7.0]
  def change
    create_table :coffee_shops do |t|
      t.string :name
      t.string :district
      t.string :state
      t.jsonb :urls
      t.integer :status

      t.timestamps
    end
    add_index :coffee_shops, :name, unique: true
    add_index :coffee_shops, :status
  end
end
