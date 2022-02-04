class CreateTags < ActiveRecord::Migration[7.0]
  def change
    create_table :tags do |t|
      t.string :name, null: false, required: true
      t.string :slug, null: false, required: true
      t.string :colour, null: false, required: true

      t.timestamps
    end
    add_index :tags, :slug, unique: true
    add_index :tags, :name, unique: true
  end
end
