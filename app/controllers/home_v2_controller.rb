class HomeV2Controller < ApplicationController
  DEFAULT_ITEMS_PER_PAGE = 20

  def index
    @collections =
      if current_user
        current_user
          .collections
          .select(:id, :name)
          .order(:name)
          .limit(10)
      else
        []
      end
  end
end
