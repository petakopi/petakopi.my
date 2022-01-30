class LocationsController < ApplicationController
  def cities
    @target = params[:target]
    @districts = Location.districts(state: params[:state])

    respond_to do |format|
      format.turbo_stream
    end
  end
end
