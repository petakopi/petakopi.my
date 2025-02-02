class LocationsController < ApplicationController
  def cities
    @target = params[:target]
    @districts = CoffeeShop.status_published.where(state: params[:state]).distinct.pluck(:district).compact.sort
    @districts = @districts.prepend("") if params[:include_blank]

    respond_to do |format|
      format.turbo_stream
    end
  end
end
