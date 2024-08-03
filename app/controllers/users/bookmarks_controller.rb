class Users::BookmarksController < ApplicationController
  def index
    @user = User.find_by!(username: params[:user_id])

    @bookmarks =
      @user
        .bookmarks
        .includes(coffee_shop: [logo_attachment: :blob])
        .with_published_coffee_shop
  end
end
