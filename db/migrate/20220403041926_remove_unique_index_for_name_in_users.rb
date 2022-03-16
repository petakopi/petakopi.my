class RemoveUniqueIndexForNameInUsers < ActiveRecord::Migration[7.0]
  def change
    remove_index :users, :name, name: "index_users_on_name", unique: true
  end
end
