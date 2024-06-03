class CreateBookmarkCollections < ActiveRecord::Migration[7.1]
  def change
    create_table :bookmark_collections do |t|
      t.references :bookmark, null: false, foreign_key: true
      t.references :collection, null: false, foreign_key: true

      t.timestamps
    end
  end
end
