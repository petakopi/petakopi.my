class BidsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_coffee_shop

  def new
    @auction = Auction.find_by(slug: params[:auction_id])
    @bid = @auction.bids.new(coffee_shop: current_user.coffee_shops.first)

    @frame_id = params[:frame_id]
  end

  def create
    @auction = Auction.find_by(slug: params[:auction_id])
    current_winners =
      @auction
        .ordered_bidders
        .first(Auction::MAXIMUM_WINNERS)
        .pluck(:coffee_shop_id)

    @bid = @auction.bids.new(bid_params)
    @bid.user = current_user
    @frame_id = params[:frame_id]

    respond_to do |format|
      if @bid.save
        message = [
          "Auction Title: #{@auction.title}",
          "Bidder: #{@bid.coffee_shop.name}",
          "Bid Amount: RM#{@bid.amount}",
          "Bid at: #{@bid.created_at.to_fs(:db)}",
        ].join("\n")

        TelegramNotifierWorker.perform_async(message)
        OutbidNotifierWorker.perform_async(@auction.id, current_winners)

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

  def require_coffee_shop
    if current_user.coffee_shops.empty?
      redirect_to root_path, alert: "You need to have a coffee shop assigned to you to bid for the ads"
    end
  end
end
