class ApplicationController < ActionController::Base
  include Pagy::Backend

  before_action :set_paper_trail_whodunnit
  before_action :configure_permitted_parameters, if: :devise_controller?
  before_action :store_user_location!, if: :storable_location?

  helper_method :turbo_native_app?

  rescue_from RailsCloudflareTurnstile::Forbidden, with: :redirect_to_turnstile_last_page
  rescue_from Pagy::OverflowError, with: :redirect_to_pagy_last_page

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:username])
  end

  def storable_location?
    request.get? && is_navigational_format? && !devise_controller? && !request.xhr?
  end

  def store_user_location!
    store_location_for(:user, request.fullpath)
  end

  def after_sign_in_path_for(resource_or_scope)
    if turbo_native_app?
      turbo_recede_historical_location_path
    else
      request.env["omniauth.origin"] ||
        stored_location_for(resource_or_scope) ||
        super
    end
  end

  def render_forbidden
    render "errors/forbidden",
      layout: "application_full",
      status: :forbidden
  end

  def redirect_to_pagy_last_page(exception)
    redirect_to url_for(page: exception.pagy.last),
      alert: "Page #{params[:page]} doesn't exist. Showing page #{exception.pagy.last} instead."
  end

  def redirect_to_turnstile_last_page
    return_url = params[:return_to]

    return redirect_to root_path if return_url.blank?

    redirect_to root_path,
      alert: "Please complete the CAPTCHA challenge. Try again <a class='underline' href=\"#{return_url}\">here</a>.".html_safe
  end
end
