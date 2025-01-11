namespace :report do
  # tomo run -- petakopi:tasks report:closed_coffee_shops
  # https://console.cloud.google.com/google/maps-apis/quotas
  desc "Generate report for closed businesses"
  task closed_coffee_shops: :environment do
    require "google/apis/sheets_v4"

    spreadsheet_id = UpdateCoffeeShopOperationStatus::SPREADSHEET_ID
    sheet_name = Date.today.iso8601

    service = Google::Apis::SheetsV4::SheetsService.new
    service.authorization = GoogleCredentials.call(account: :spreadsheet)

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

    synced_coffe_shop_ids = SyncLog .where("created_at > ?", ClosedCoffeeShopThrottler::TIME_LIMIT) .where(message: ClosedCoffeeShopThrottler::MESSAGE) .pluck(:syncable_id)

    unsynced_coffee_shop_ids = CoffeeShop .status_published .where.associated(:google_location) .where.not(id: synced_coffe_shop_ids) .pluck(:id)

    puts "We will process #{unsynced_coffee_shop_ids.count} coffee shops"

    unsynced_coffee_shop_ids.each do |coffee_shop_id|
      puts coffee_shop_id
      begin
        ReportCoffeeShopOperationStatusWorker.new.perform(coffee_shop_id)
      rescue StandardError => exception
        puts "Error: #{exception.message}"
      end
      sleep(2)
    end
  end

  desc "Generate report for temoporarily closed businesses"
  task temporarily_closed_coffee_shops: :environment do
    require "google/apis/sheets_v4"

    spreadsheet_id = UpdateCoffeeShopOperationStatus::SPREADSHEET_ID
    sheet_name = Date.today.iso8601

    service = Google::Apis::SheetsV4::SheetsService.new
    service.authorization = GoogleCredentials.call(account: :spreadsheet)

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

    synced_coffe_shop_ids =
      SyncLog
        .where("created_at > ?", TemporarilyClosedCoffeeShopThrottler::TIME_LIMIT)
        .where(message: TemporarilyClosedCoffeeShopThrottler::MESSAGE)
        .pluck(:syncable_id)

    unsynced_coffee_shop_ids =
      CoffeeShop
        .status_temporarily_closed
        .where.associated(:google_location)
        .where.not(id: synced_coffe_shop_ids)
        .pluck(:id)

    puts "We will process #{unsynced_coffee_shop_ids.count} temporarily closed coffee shops"

    unsynced_coffee_shop_ids.each do |coffee_shop_id|
      ReportTemporarilyClosedCoffeeShopOperationStatusWorker
        .new.perform(coffee_shop_id)
    end
  end
end
