class TelegramController < ApplicationController
  layout "application_full"

  def new
    @return_path = request.referer
  end

  def create
    return handle_turnstile_failure unless verify_cloudflare_turnstile

    redirect_to "https://t.me/petakopi", allow_other_host: true
  end

  private

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
end
