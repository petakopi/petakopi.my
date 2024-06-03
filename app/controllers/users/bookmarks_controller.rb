class Users::BookmarksController < ApplicationController
  def index
    @user = User.find_by!(username: params[:user_id])

    @bookmarks =
      @user
        .bookmarks
        .includes(coffee_shop: [logo_attachment: :blob])
        .with_published_coffee_shop

    if params[:collection_id].present?
      collection = @user.collections.find(params[:collection_id])
      @bookmarks =
        @bookmarks
          .joins(:collections)
          .where(collections: {id: collection})
    end
  end
end
