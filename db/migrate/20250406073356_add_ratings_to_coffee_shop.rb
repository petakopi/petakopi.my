class AddRatingsToCoffeeShop < ActiveRecord::Migration[8.0]
  def change
    add_column :coffee_shops, :rating, :float, default: nil
    add_column :coffee_shops, :rating_count, :integer, default: nil
  end
end
