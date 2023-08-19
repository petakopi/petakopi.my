namespace :report do
  desc "Generate report for closed businesses"
  task closed_coffee_shops: :environment do
    require "google/apis/sheets_v4"

    spreadsheet_id = UpdateClosedCoffeeShop::SPREADSHEET_ID
    sheet_name = Date.today.iso8601

    service = Google::Apis::SheetsV4::SheetsService.new
    service.authorization = GoogleCredentials.call

    spreadsheet = service.get_spreadsheet(spreadsheet_id)
    sheet_is_available =
      spreadsheet.sheets.any? { |sheet| sheet.properties.title == sheet_name }

    unless sheet_is_available
      add_sheet_request = {
        add_sheet: {
          properties: {
            title: sheet_name
          }
        }
      }

      # Add sheet by today's date
      batch_update_request =
        Google::Apis::SheetsV4::BatchUpdateSpreadsheetRequest.new(requests: [add_sheet_request])
      service.batch_update_spreadsheet(spreadsheet_id, batch_update_request)
    end


    CoffeeShop.status_published.pluck(:id).each do |coffee_shop_id|
      ReportClosedCoffeeShopWorker.perform_async(coffee_shop_id)
    end
  end
end
