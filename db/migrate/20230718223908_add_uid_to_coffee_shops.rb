class AddUidToCoffeeShops < ActiveRecord::Migration[7.0]
  def change
    add_column :coffee_shops, :uuid, :string, default: nil
  end
end
