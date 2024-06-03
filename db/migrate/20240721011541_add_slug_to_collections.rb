class AddSlugToCollections < ActiveRecord::Migration[7.1]
  def change
    add_column :collections, :slug, :string
  end
end
