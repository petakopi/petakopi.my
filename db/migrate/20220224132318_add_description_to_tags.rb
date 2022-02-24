class AddDescriptionToTags < ActiveRecord::Migration[7.0]
  def change
    add_column :tags, :description, :string
  end
end
