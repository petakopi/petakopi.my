class BookmarkCollection < ApplicationRecord
  belongs_to :bookmark
  belongs_to :collection, touch: true
end
