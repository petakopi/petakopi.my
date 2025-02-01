class EnablePostgisExtension < ActiveRecord::Migration[7.2]
  def change
    enable_extension "postgis"
  end
end
