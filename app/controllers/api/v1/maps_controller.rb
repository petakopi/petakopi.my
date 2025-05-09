class Api::V1::MapsController < ApiController
  KLCC_COORDINATES = {
    lat: 3.1578,
    lng: 101.7117
  }.freeze

  def index
    coffee_shops =
      CoffeeShopsListQuery
        .call(
          params: params,
          relation:
            CoffeeShop
              .includes(
                logo_attachment: :blob,
                cover_photo_attachment: :blob
              )
              .where.not(location: nil)
        ).status_published

    @coffee_shops = coffee_shops
    @default_center = KLCC_COORDINATES
  end
end
