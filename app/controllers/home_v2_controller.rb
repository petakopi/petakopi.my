class HomeV2Controller < ApplicationController
  DEFAULT_ITEMS_PER_PAGE = 20

  def index
    @collections = current_user.collections.select(:id, :name).order(:name)
  end
end
