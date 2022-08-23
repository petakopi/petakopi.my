class RemoveColourFromTags < ActiveRecord::Migration[7.0]
  def up
    remove_column :tags, :colour
  end

  def down
    add_column :tags, :colour, :string
  end
end
