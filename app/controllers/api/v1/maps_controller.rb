class Api::V1::MapsController < ApiController
  def index
    @coffee_shops = CoffeeShop
      .includes(logo_attachment: :blob)
      .status_published
      .order(approved_at: :desc)

    if params.values_at(:sw_lat, :sw_lng, :ne_lat, :ne_lng).all?(&:present?)
      sw_lat = params[:sw_lat].to_f
      sw_lng = params[:sw_lng].to_f
      ne_lat = params[:ne_lat].to_f
      ne_lng = params[:ne_lng].to_f

      @coffee_shops = coffee_shops.where(
        "ST_Within(location, ST_MakeEnvelope(?, ?, ?, ?, 4326))",
        sw_lng, sw_lat, ne_lng, ne_lat
      )
    end

    render json: @coffee_shops
  end
end
