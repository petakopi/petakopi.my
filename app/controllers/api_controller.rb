class ApiController < ApplicationController
  rescue_from ActiveRecord::RecordNotFound, with: :record_not_found

  def record_not_found
    render json: {
      status: "error",
      message: "Record not found"
    }, status: :not_found
  end
end
