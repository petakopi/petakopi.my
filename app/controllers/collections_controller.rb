class CollectionsController < ApplicationController
  # Used in coffee shop
  def new
    @collection = Collection.new
    @current_user_collections = current_user.collections
    @bookmark = current_user.bookmarks.find(params[:bookmark_id])
  end

  # Used in coffee shop
  def create
    @collection = current_user.collections.new(collection_create_params)

    if @collection.save
      @bookmark = current_user.bookmarks.find_by(id: params[:bookmark_id])
      @bookmark.collections << @collection if @bookmark
    else
      render :new
    end
  end

  # Used in user
  def edit
    @collection = current_user.collections.find_by!(slug: params[:id])
  end

  # Used in user
  def update
    @collection = current_user.collections.find_by!(slug: params[:id])

    if @collection.update(collection_edit_params)
      @collections = current_user.collections.order(name: :asc)
    else
      render :edit
    end
  end

  # Used in user
  def destroy
    current_user
      .collections
      .find_by!(slug: params[:id])
      .destroy

    @collections = current_user.collections.order(name: :asc)
  end

  private

  def collection_create_params
    params.require(:collection).permit(:bookmark_id, :name)
  end

  def collection_edit_params
    params.require(:collection).permit(:name)
  end
end
