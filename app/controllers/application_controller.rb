class ApplicationController < ActionController::Base
  include Pagy::Backend

  before_action :set_paper_trail_whodunnit
  before_action :configure_permitted_parameters, if: :devise_controller?
  before_action :store_user_location!, if: :storable_location?

  helper_method :turbo_native_app?

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:name])
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
end
