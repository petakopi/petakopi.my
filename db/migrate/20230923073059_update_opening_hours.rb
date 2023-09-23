class UpdateOpeningHours < ActiveRecord::Migration[7.0]
  def change
    add_column :opening_hours, :kind, :string
    add_column :opening_hours, :day, :integer
    add_column :opening_hours, :time, :integer

    remove_column :opening_hours, :open_day, :integer
    remove_column :opening_hours, :open_time, :string
    remove_column :opening_hours, :close_day, :integer
    remove_column :opening_hours, :close_time, :string
  end
end
