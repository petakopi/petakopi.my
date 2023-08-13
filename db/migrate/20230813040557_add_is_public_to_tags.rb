class AddIsPublicToTags < ActiveRecord::Migration[7.0]
  def change
    add_column :tags, :is_public, :boolean, default: true
  end
end
