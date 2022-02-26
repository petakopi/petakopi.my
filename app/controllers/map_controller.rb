class MapController < ApplicationController
  http_basic_authenticate_with :name => "amree", :password => ENV.fetch("MAP_PASSWORD")

  def index
  end
end
