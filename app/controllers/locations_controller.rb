class LocationsController < ApplicationController
  def cities
    @target = params[:target]
    @districts = GoogleLocation.where(administrative_area_level_1: params[:state]).distinct.pluck(:locality).compact.sort
    @districts = @districts.prepend("") if params[:include_blank]

    respond_to do |format|
      format.turbo_stream
    end
  end
end
