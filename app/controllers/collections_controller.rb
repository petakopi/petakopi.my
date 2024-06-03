class CollectionsController < ApplicationController
  def new
    @collection = Collection.new
    @bookmark = current_user.bookmarks.find(params[:bookmark_id])
  end

  def create
    @collection = current_user.collections.new(collection_params)

    if @collection.save
      @bookmark = current_user.bookmarks.find_by(id: params[:bookmark_id])
      @bookmark.collections << @collection if @bookmark
    else
      render :new
    end
  end

  private

  def collection_params
    params.require(:collection).permit(:bookmark_id, :name)
  end
end
