class UsersController < ApplicationController
  def show
    @user = User.find_by(username: params[:id])
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
        :username
      )
  end
end
