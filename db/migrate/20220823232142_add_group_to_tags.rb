class AddGroupToTags < ActiveRecord::Migration[7.0]
  def change
    add_column :tags, :group, :string
  end
end
