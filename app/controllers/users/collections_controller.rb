class Users::CollectionsController < ApplicationController
  def show
    @user = User.find_by!(username: params[:user_id])
    @collection = @user.collections.find(params[:collection_slug])
    @bookmarks =
      @collection
        .bookmarks
        .includes(coffee_shop: [logo_attachment: :blob])
        .with_published_coffee_shop
  end
end
