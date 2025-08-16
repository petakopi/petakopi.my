class CreateAuctions < ActiveRecord::Migration[7.1]
  def change
    create_table :auctions do |t|
      t.string :title, null: false, index: {unique: true}
      t.string :slug, null: false, index: {unique: true}
      t.text :description, null: false
      t.decimal :minimum_amount, null: false
      t.datetime :start_at, null: false
      t.datetime :end_at, null: false

      t.timestamps
    end
  end
end
