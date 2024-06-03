class BookmarksController < ApplicationController
  # TODO: Remove?
  def new; end

  def edit
    @bookmark = current_user.bookmarks.find(params[:id])
  end

  def update
    @bookmark = current_user.bookmarks.find(params[:id])
    @bookmark.update(bookmark_params)
  end

  def create
    # TODO: Error handling?
    @coffee_shop = CoffeeShop.find_by(slug: params[:coffee_shop_id])
    @bookmark =
      Bookmark.find_or_create_by(
        user: current_user,
        coffee_shop: @coffee_shop
      )
    @bookmark_count = Bookmark.where(coffee_shop: @coffee_shop).count
  end

  def destroy
    @bookmark = current_user.bookmarks.find(params[:id])
    @coffee_shop = @bookmark.coffee_shop
    @bookmark.destroy
    @bookmark_count = Bookmark.where(coffee_shop: @coffee_shop).count
  end

  private

  def bookmark_params
    params
      .require(:bookmark)
      .permit(
        collection_ids: []
      )
  end
end
