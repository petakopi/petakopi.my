class AddTimeColumnsToOpeningHours < ActiveRecord::Migration[7.1]
  def change
    add_column :opening_hours, :start_day, :integer
    add_column :opening_hours, :start_time, :integer
    add_column :opening_hours, :close_day, :integer
    add_column :opening_hours, :close_time, :integer
  end
end
