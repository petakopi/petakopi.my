class MapController < ApplicationController
  if Rails.env.production?
    http_basic_authenticate_with :name => "petakopi", :password => ENV.fetch("MAP_PASSWORD")
  end

  def index
  end
end
