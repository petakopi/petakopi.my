class AddCoffeeShopSlug < ActiveRecord::Migration[7.0]
  def change
    add_column :coffee_shops, :slug, :string, null: false
    add_index :coffee_shops, :slug, unique: true
  end
end
