require "google/apis/sheets_v4"
require "googleauth"
require "googleauth/stores/file_token_store"

class GoogleCredentials
  include Callable

  def initialize(account:)
    @account = account
  end

  def call
    Google::Auth::ServiceAccountCredentials.new(
      token_credential_uri: "https://oauth2.googleapis.com/token",
      audience: "https://oauth2.googleapis.com/token",
      scope: Google::Apis::SheetsV4::AUTH_SPREADSHEETS,
      issuer: ENV.fetch("GOOGLE_SERVICE_SPREADSHEET_EMAIL"),
      signing_key: OpenSSL::PKey::RSA.new(ENV.fetch("GOOGLE_SERVICE_SPREADSHEET_PRIVATE_KEY"))
    )
  end
end
