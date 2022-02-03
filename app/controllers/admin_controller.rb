class AdminController < ApplicationController
  before_action :verify_admin_access

  def verify_admin_access
    return redirect_to root_path if current_user.nil?

    redirect_to root_path unless current_user.is_admin?
  end
end
