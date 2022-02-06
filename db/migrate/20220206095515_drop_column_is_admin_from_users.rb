class DropColumnIsAdminFromUsers < ActiveRecord::Migration[7.0]
  def up
    remove_column :users, :is_admin
  end

  def down
    add_column :users, :is_admin, :boolean, default: false
  end
end
