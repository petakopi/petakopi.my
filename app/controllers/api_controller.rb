class ApiController < ApplicationController
  protect_from_forgery with: :null_session
  rescue_from ActiveRecord::RecordNotFound, with: :record_not_found

  def record_not_found
    render json: {
      status: "error",
      message: "Record not found"
    }, status: :not_found
  end

  private

  # Format errors following Rails API conventions
  # Supports both field-specific errors and base errors
  def format_errors(errors)
    formatted = {}

    # Group errors by field
    errors.group_by(&:attribute).each do |field, field_errors|
      formatted[field] = field_errors.map do |error|
        # Strip HTML tags from error messages for API responses
        ActionView::Base.full_sanitizer.sanitize(error.message)
      end
    end

    formatted
  end
end
