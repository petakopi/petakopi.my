class ReportsController < ApplicationController
  before_action :set_coffee_shop, only: %i[new create]

  def new
    @return_path = request.referer
  end

  def create
    return handle_turnstile_failure unless verify_cloudflare_turnstile

    if params[:report_action] == "telegram"
      redirect_to "https://t.me/petakopi", allow_other_host: true
    else
      message = [
        "Coffee Shop ID: #{@coffee_shop.id}",
        "Coffee Shop Name: #{@coffee_shop.name}",
        "Email: #{params[:email] || "N/A"}",
        "Report: #{params[:message] || "N/A"}",
        "Submitted at: #{Time.current}"
      ].join("\n")

      TelegramNotifierWorker.perform_async(message)
      redirect_to coffee_shop_path(@coffee_shop.slug), notice: "Thank you for your report. We will review it shortly."
    end
  end

  private

  def set_coffee_shop
    @coffee_shop =
      CoffeeShop.find_by(slug: params[:coffee_shop_id]) ||
      CoffeeShop.find_by(id: params[:coffee_shop_id])
  end

  def verify_cloudflare_turnstile
    response = HTTP.post(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      form: {
        secret: ENV.fetch("CLOUDFLARE_TURNSTILE_SECRET_KEY"),
        response: params[:cf_turnstile_response] || params["cf-turnstile-response"],
        remoteip: request.remote_ip
      }
    )

    JSON.parse(response.body.to_s)["success"]
  end

  def handle_turnstile_failure
    flash.now[:alert] = "Please verify that you are not a robot."
    render :new, status: :unprocessable_entity
  end

  def report_params
    params.permit(:email, :message)
  end
end
