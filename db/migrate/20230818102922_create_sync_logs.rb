class CreateSyncLogs < ActiveRecord::Migration[7.0]
  def change
    create_table :sync_logs do |t|
      t.references :syncable, polymorphic: true, null: false
      t.string :message

      t.timestamps
    end
  end
end
