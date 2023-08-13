class Api::V1::CoffeeShopsController < ApplicationController
  def index
    coffee_shops =
      CoffeeShop
        .includes(logo_attachment: :blob)
        .status_published
        .where
        .not(lat: nil, lng: nil)
        .select(
          :id,
          :name,
          :slug,
          :lat,
          :lng
        )

    @coffee_shops =
      CoffeeShopsListQuery.call(
        params: params,
        relation: coffee_shops
      )
  end

  def show
    @coffee_shop =
      CoffeeShop
        .status_published
        .find_by(slug: params[:id])

    # Temporary, of course
    @coffee_shop.extend(CoffeeShopDecorator)
    @links = [
      {"Google Map" => @coffee_shop.google_map},
      {"Facebook" => @coffee_shop.facebook_url},
      {"Instagram" => @coffee_shop.instagram_url},
      {"Twitter" => @coffee_shop.twitter_url},
      {"TikTok" => @coffee_shop.tiktok_url},
      {"WhatsApp" => @coffee_shop.whatsapp_url}
    ]
      .map(&:compact)
      .reject(&:empty?)
      .map do |link|
        name, url = link.flatten

        {"name" => name, "url" => url}
      end
  end
end
