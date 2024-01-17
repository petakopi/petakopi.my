require "google/apis/sheets_v4"

class UpdateCoffeeShopOperationStatus
  include Callable
  include Rails.application.routes.url_helpers

  SPREADSHEET_ID = "1tdoEZRvUr5-JF9FKNQ-61czzHhcg3Ouv0v16RcAqW1w"

  def initialize(coffee_shop:)
    @coffee_shop = coffee_shop
  end

  def call
    return if place_id.blank?
    return if bussiness_status == "OPERATIONAL"

    row = [
      @coffee_shop.id,
      cell_link(@coffee_shop.name, admin_coffee_shop_path(@coffee_shop)),
      cell_link(@coffee_shop.name, main_coffee_shop_path(id: @coffee_shop.slug)),
      place_id,
      business_status,
      Rails.env,
      Time.current.iso8601
    ]

    body = Google::Apis::SheetsV4::ValueRange.new
    body.values = [row]

    service
      .append_spreadsheet_value(
        SPREADSHEET_ID,
        "#{sheet_name}!A1",
        body,
        value_input_option: "USER_ENTERED"
      )
  end

  private

  def sheet_name
    Date.today.iso8601
  end

  def place_id
    @coffee_shop.google_place_id
  end

  def api_key
    Rails.application.credentials.dig(:google_api_key, :api)
  end

  def service
    @service ||= Google::Apis::SheetsV4::SheetsService.new.tap do |svc|
      svc.authorization = GoogleCredentials.call(account: :spreadsheet)
    end
  end

  def business_status
    @business_status ||= do
      result = HTTP.get("https://maps.googleapis.com/maps/api/place/details/json?place_id=#{place_id}&fields=business_status&key=#{api_key}")

      if result.status.code != 200
        raise result.parse
      elsif result.status.success? && result.parse.dig("error_message").present?
        raise result.parse.dig("error_message")
      end

        result.parse.dig("result", "business_status")
    end
  end

  def cell_link(name, url)
    "=HYPERLINK(\"https://petakopi.my#{url}\",\"#{name}\")"
  end
end
