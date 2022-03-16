class CreateAuthProviders < ActiveRecord::Migration[7.0]
  def change
    create_table :auth_providers do |t|
      t.references :user, null: false, foreign_key: true
      t.string :provider
      t.string :uid

      t.timestamps
    end
  end
end
