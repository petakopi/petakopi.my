class AddAdminNotesToCoffeeShops < ActiveRecord::Migration[7.0]
  def change
    add_column :coffee_shops, :admin_notes, :text
  end
end
