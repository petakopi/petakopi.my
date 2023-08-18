class SyncLog < ApplicationRecord
  belongs_to :syncable, polymorphic: true
end
