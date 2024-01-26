class BidsController < ApplicationController
  def new
    @auction = Auction.find_by(slug: params[:auction_id])
    @bid = @auction.bids.new(coffee_shop: current_user.coffee_shops.first)
  end

  def create
    @auction = Auction.find_by(slug: params[:auction_id])
    @bid = @auction.bids.new(bid_params)
    @bid.user = current_user

    respond_to do |format|
      if @bid.save
        format.turbo_stream
      else
        format.html { render :new, status: :unprocessable_entity }
      end
    end
  end

  private

  def bid_params
    params
      .require(:bid)
      .permit(
        :amount,
        :coffee_shop_id
      )
  end
end
