class MapController < ApplicationController
  layout :current_layout

  def index
  end

  private

  def current_layout
    return "application_full" if turbo_native_app?

    "application"
  end
end
