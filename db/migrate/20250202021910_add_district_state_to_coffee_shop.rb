class AddDistrictStateToCoffeeShop < ActiveRecord::Migration[7.2]
  def change
    add_column :coffee_shops, :district, :string
    add_column :coffee_shops, :state, :string
  end
end
