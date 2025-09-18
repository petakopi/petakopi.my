class Api::V1::AuthenticationController < ApiController
  respond_to :json

  def login
    provider = params[:provider]&.to_s&.downcase
    id_token = params[:id_token]

    unless provider.present? && id_token.present?
      return render json: {
        error: "Missing provider or id_token"
      }, status: :bad_request
    end

    result = Api::Auth::SocialLoginService.new(provider, id_token).call

    if result[:success]
      # Sign in the user with Devise, which automatically generates JWT token
      sign_in(result[:user])

      render json: {
        user: Api::UserPresenter.new(result[:user]).profile
      }, status: :ok
    else
      render json: {
        error: result[:error]
      }, status: :unauthorized
    end
  end

  def logout
    if current_user
      sign_out(current_user)
      render json: {message: "Logged out successfully"}, status: :ok
    else
      render json: {error: "Not logged in"}, status: :unauthorized
    end
  end
end
