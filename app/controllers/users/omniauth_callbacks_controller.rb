class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  skip_before_action :verify_authenticity_token

  def failure
    redirect_to root_path, alert: "Authentication failed, please try again."
  end

  def omniauth
    @user = OmniauthHandler.call(payload: request.env["omniauth.auth"])
    provider = request.env.dig("omniauth.auth", "provider")&.titleize

    if @user.persisted?
      sign_in_and_redirect @user, event: :authentication

      if is_navigational_format?
        set_flash_message(:notice, :success, kind: provider)
      end
    else
      redirect_to(
        root_path,
        alert: @user.errors.full_messages.join("\n")
      )
    end
  rescue
    redirect_to root_path, alert: "Authentication failed, please try again."
  end

  alias_method :apple, :omniauth
  alias_method :google_oauth2, :omniauth
end
