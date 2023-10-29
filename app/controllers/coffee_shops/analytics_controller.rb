class CoffeeShops::AnalyticsController < ApplicationController
  def show
    @coffee_shop = current_user.coffee_shops.find_by(slug: params[:coffee_shop_id]) ||
      current_user.coffee_shops.find(params[:coffee_shop_id].to_i)

    @visits =
      Ahoy::Event.where_event(
        "View Coffee Shop",
        id: @coffee_shop.id
      ).where(time: 90.days.ago..).group_by_day(:time).count

    @outbound_links = @coffee_shop.urls.select { |k, v| v.present? }.keys
  end
end
