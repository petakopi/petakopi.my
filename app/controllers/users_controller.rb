class UsersController < ApplicationController
  def show
    @user = User.find_by!(username: params[:id])
    @favourites =
      @user
        .favourite_coffee_shops
        .includes(logo_attachment: :blob)
        .order(created_at: :desc)

    @submitted_coffee_shops =
      @user
      .submitted_coffee_shops
      .status_published
      .includes(logo_attachment: :blob)
      .order(approved_at: :desc)
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
