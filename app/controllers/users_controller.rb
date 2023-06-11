class UsersController < ApplicationController
  before_action :authenticate_user!, only: [:edit, :update]

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

    check_in_range = (1.year.ago + 1.day).to_date..Date.today
    @check_ins =
      CheckIn
        .where(user: @user)
        .group_by_day(:created_at, range: check_in_range, format: "%A, %B %e, %Y")
        .count

    @check_in_months = check_in_range.map { |date| date.strftime("%B") }.uniq
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
