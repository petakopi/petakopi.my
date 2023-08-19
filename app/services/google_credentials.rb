class GoogleCredentials
  include Callable

  CLIENT_ID = Rails.application.credentials.dig(:google_oauth, :client_id)
  CLIENT_SECRET = Rails.application.credentials.dig(:google_oauth, :client_secret)
  REFRESH_TOKEN = Rails.application.credentials.dig(:google_oauth, :sheets_refresh_token)
  SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
  ].freeze

  def call
    creds = Google::Auth::UserRefreshCredentials.new(credentials_config)
    creds.refresh_token = REFRESH_TOKEN
    creds.fetch_access_token!
    creds
  end

  private

  def credentials_config
    {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: SCOPES,
      additional_parameters: { "access_type" => "offline" },
    }
  end
end

