class AuctionsController < ApplicationController
  def index
    @current_auctions =
      Auction
        .includes(:bids)
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
    @auction = Auction.find_by(slug: params[:id])
  end
end
