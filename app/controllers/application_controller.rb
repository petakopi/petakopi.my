class ApplicationController < ActionController::Base
  before_action :configure_permitted_parameters, if: :devise_controller?
  before_action :http_authenticate

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:name])
  end

  def http_authenticate
    return true unless Rails.env == "production"

    authenticate_or_request_with_http_basic do |username, password|
      # Congrats, you found the password. Feel free to browse the website ;)
      username == "petakopi" && password == "kopimung"
    end
  end
end
