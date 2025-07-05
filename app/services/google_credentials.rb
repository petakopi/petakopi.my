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
      signing_key: OpenSSL::PKey::RSA.new(formatted_pem_key)
    )
  end

  private

  def formatted_pem_key
    key_string = ENV.fetch("GOOGLE_SERVICE_SPREADSHEET_PRIVATE_KEY")

    # Extract the content between the headers
    content = key_string.match(/-----BEGIN PRIVATE KEY-----(.+?)-----END PRIVATE KEY-----/m)[1]

    # Remove any existing whitespace/newlines from the content
    clean_content = content.gsub(/\s+/, "")

    # Split into 64-character lines
    formatted_content = clean_content.scan(/.{1,64}/).join("\n")

    # Rebuild the key with proper headers
    "-----BEGIN PRIVATE KEY-----\n#{formatted_content}\n-----END PRIVATE KEY-----"
  end
end
