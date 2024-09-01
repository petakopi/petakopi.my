class UsersController < ApplicationController
  before_action :authenticate_user!, only: [:edit, :update]

  def show
    @user = User.find_by(username: params[:id])

    return redirect_to root_path, alert: "User #{params[:id]} not found" if @user.nil?

    @bookmarks =
      Bookmark
        .includes(coffee_shop: [logo_attachment: :blob])
        .with_published_coffee_shop
        .where(user: @user)
    @collections = @user.collections.order(name: :asc)
    @submitted_coffee_shops =
      @user
        .submitted_coffee_shops
        .status_published
        .includes(logo_attachment: :blob)
        .order(approved_at: :desc)
        .limit(5)
  end

  def edit
    @user = current_user
  end

  def update
    @user = current_user

    if @user.update(user_params)
      redirect_to user_path(@user.username), notice: "User was successfully updated."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params
      .require(:user)
      .permit(
        :name,
        :username,
        :avatar
      )
  end
end
