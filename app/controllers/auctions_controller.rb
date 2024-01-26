class AuctionsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_coffee_shop

  def index
    @current_auctions =
      Auction
        .includes(bids: {coffee_shop: { logo_attachment: :blob } })
        .where("end_at > ?", Time.current)
        .where("start_at < ?", Time.current)
        .order(end_at: :asc)

    @past_auctions =
      Auction
        .includes(:bids)
        .where("end_at < ?", Time.current)
        .order(end_at: :desc)
  end

  def show
    @auction = Auction.find_by!(slug: params[:id])
  end

  private

  def require_coffee_shop
    if current_user.coffee_shops.empty?
      redirect_to root_path, alert: "You need to have a coffee shop assigned to you to bid for the ads"
    end
  end
end
