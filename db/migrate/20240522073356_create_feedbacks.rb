class CreateFeedbacks < ActiveRecord::Migration[7.1]
  def change
    create_table :feedbacks do |t|
      t.references :user, foreign_key: true
      t.references :coffee_shop, null: false, foreign_key: true
      t.string :contact
      t.text :message, null: false
      t.timestamp :opened_at

      t.timestamps
    end
  end
end
