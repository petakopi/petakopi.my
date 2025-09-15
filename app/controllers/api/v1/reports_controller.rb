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
end
