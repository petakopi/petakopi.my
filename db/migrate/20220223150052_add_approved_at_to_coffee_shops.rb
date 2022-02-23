class AddApprovedAtToCoffeeShops < ActiveRecord::Migration[7.0]
  def change
    add_column :coffee_shops, :approved_at, :datetime
  end
end
