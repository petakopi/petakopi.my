class ApiController < ApplicationController
  DEFAULT_ITEMS_PER_PAGE = 20

  rescue_from ActiveRecord::RecordNotFound, with: :record_not_found

  def record_not_found
    render json: {
      status: "error",
      message: "Record not found"
    }, status: :not_found
  end
end
