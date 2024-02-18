class UpdateOutdatedOpeningHours < ActiveRecord::Migration[7.1]
  def change
    remove_column :opening_hours, :kind, :string
    remove_column :opening_hours, :day, :integer
    remove_column :opening_hours, :time, :integer
  end
end
