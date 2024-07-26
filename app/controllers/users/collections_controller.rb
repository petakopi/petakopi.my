class Users::CollectionsController < ApplicationController
  def show
    @user = User.find_by!(username: params[:user_id])
    @collection = @user.collections.find_by!(slug: params[:collection_slug])
    @bookmarks =
      @collection
        .bookmarks
        .includes(coffee_shop: [logo_attachment: :blob])
        .with_published_coffee_shop
        .order("bookmark_collections.created_at DESC")
  end
end
