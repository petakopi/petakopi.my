class CreateCoffeeShopTags < ActiveRecord::Migration[7.0]
  def change
    create_table :coffee_shop_tags do |t|
      t.references :coffee_shop, null: false, foreign_key: true
      t.references :tag, null: false, foreign_key: true

      t.timestamps
    end
  end
end
