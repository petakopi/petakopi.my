class AddPeriodToAuctions < ActiveRecord::Migration[7.1]
  def change
    add_column :auctions, :period, :string
    add_index :auctions, :period, unique: true
  end
end
