class AddSubmitterToCoffeeShops < ActiveRecord::Migration[7.0]
  def change
    add_column :coffee_shops, :submitter_user_id, :bigint, index: true
    add_index :coffee_shops, :submitter_user_id
    add_foreign_key :coffee_shops, :users, column: :submitter_user_id
  end
end
