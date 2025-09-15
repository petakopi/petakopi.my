class Api::V1::ReportsController < ApiController
  def create
    @report_form = ReportForm.new(report_params)

    if @report_form.submit
      render json: {
        message: "Thank you for your report. We will review it shortly."
      }, status: :created
    elsif @report_form.not_found_error?
      render json: {
        errors: format_errors(@report_form.errors)
      }, status: :not_found
    else
      render json: {
        errors: format_errors(@report_form.errors)
      }, status: :unprocessable_entity
    end
  end

  private

  def report_params
    params.permit(:coffee_shop_id, :email, :message)
  end

  # Format errors following Rails API conventions
  # Supports both field-specific errors and base errors
  def format_errors(errors)
    formatted = {}

    # Group errors by field
    errors.group_by(&:attribute).each do |field, field_errors|
      formatted[field] = field_errors.map(&:message)
    end

    formatted
  end
end
