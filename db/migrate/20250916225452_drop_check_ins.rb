class DropCheckIns < ActiveRecord::Migration[8.0]
  def change
    drop_table :check_ins, if_exists: true
  end
end
