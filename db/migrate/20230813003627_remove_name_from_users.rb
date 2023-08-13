class RemoveNameFromUsers < ActiveRecord::Migration[7.0]
  def change
    remove_column :users, :name, :string, null: false
  end
end
