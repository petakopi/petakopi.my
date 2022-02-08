class DropWeirdColumnFromVersions < ActiveRecord::Migration[7.0]
  def change
    remove_column :versions, "{:null=>false}", :string
  end
end
