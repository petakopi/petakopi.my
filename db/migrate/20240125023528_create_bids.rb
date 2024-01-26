class CreateBids < ActiveRecord::Migration[7.1]
  def change
    create_table :bids do |t|
      t.references :auction, null: false, foreign_key: true
      t.references :coffee_shop, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.integer :amount, null: false

      t.timestamps
    end
  end
end
