class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  def twitter
    @user = OmniauthHandler.call(payload: request.env["omniauth.auth"])

    if @user.persisted?
      sign_in_and_redirect @user, event: :authentication

      if is_navigational_format?
        set_flash_message(:notice, :success, kind: request.env["omniauth.auth"]["provider"].titleize)
      end
    else
      session["devise.twitter_data"] = request.env["omniauth.auth"].except("extra")

      redirect_to(
        new_user_registration_path,
        alert: "Failed to login with Twitter. Please proceed with normal registration or try again."
      )
    end
  end

  def failure
    redirect_to root_path
  end
end
