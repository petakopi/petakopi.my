class Api::V1::UsersController < ApiController
  before_action :authenticate_user!

  def profile
    render json: {
      user: Api::UserPresenter.new(current_user).profile
    }, status: :ok
  end

end
