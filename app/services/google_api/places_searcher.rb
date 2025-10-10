module GoogleApi
  class PlacesSearcher
    include Callable
    include Dry::Monads[:result, :do]

    # Security constraints
    MIN_QUERY_LENGTH = 3
    MAX_QUERY_LENGTH = 100
    MAX_RESULTS = 10

    ValidationSchema = Dry::Schema.Params do
      required(:query).filled(:string)
    end

    def initialize(query:)
      @query = query
    end

    def call
      yield validate_params
      yield validate_query_content
      search_places
    end

    private

    attr_reader :query

    def api_key
      @api_key ||= ENV.fetch("GOOGLE_API_KEY_API", nil)
    end

    def validate_params
      return Failure("Google API key not configured") unless api_key.present?

      result = ValidationSchema.call(query: @query)
      return Success(nil) if result.success?

      Failure(result.errors.to_h)
    end

    def validate_query_content
      # Check minimum length
      return Failure("Query must be at least #{MIN_QUERY_LENGTH} characters") if @query.length < MIN_QUERY_LENGTH

      # Check maximum length to prevent abuse
      return Failure("Query is too long (maximum #{MAX_QUERY_LENGTH} characters)") if @query.length > MAX_QUERY_LENGTH

      # Only allow alphanumeric, spaces, and common punctuation for coffee shop searches
      unless @query.match?(/\A[a-zA-Z0-9\s\-\',\.&]+\z/)
        return Failure("Query contains invalid characters")
      end

      # Prevent potential injection attempts or suspicious patterns
      suspicious_patterns = [
        /script/i,
        /<[^>]+>/,  # HTML tags
        /\{.*\}/,   # JSON-like patterns
        /\[.*\]/,   # Array-like patterns
        /;/,        # SQL-like separators
        /--/,       # SQL comments
        /\|\|/      # Logical operators
      ]

      suspicious_patterns.each do |pattern|
        return Failure("Query contains suspicious patterns") if @query.match?(pattern)
      end

      Success(nil)
    end

    def search_places
      response = fetch_places_from_google
      return handle_response_failure(response) unless response_successful?(response)

      data = response.parse
      formatted_data = format_response(data)

      Success(formatted_data)
    rescue => e
      Rails.logger.error("Google Places API Error: #{e.message}")
      Failure("Failed to search places: #{e.message}")
    end

    def fetch_places_from_google
      sanitized_query = @query.strip

      # Log the search for monitoring
      Rails.logger.info("Google Places Search: query='#{sanitized_query}'")

      request_body = {
        textQuery: sanitized_query,
        regionCode: "MY",  # Restrict to Malaysia only
        languageCode: "en",
        maxResultCount: MAX_RESULTS
      }

      HTTP.post(
        "https://places.googleapis.com/v1/places:searchText",
        headers: {
          "Content-Type" => "application/json",
          "X-Goog-Api-Key" => api_key,
          "X-Goog-FieldMask" => "places.id,places.displayName,places.formattedAddress,places.location"
        },
        body: request_body.to_json
      )
    end

    def response_successful?(response)
      response.status.success?
    end

    def handle_response_failure(response)
      Failure("Google Places API error: #{response.status}")
    end

    def format_response(data)
      return {places: []} unless data["places"]

      {
        places: data["places"].map do |place|
          {
            place_id: place["id"],
            description: "#{place.dig("displayName", "text")}, #{place["formattedAddress"]}",
            structured_formatting: {
              main_text: place.dig("displayName", "text"),
              secondary_text: place["formattedAddress"]
            },
            location: place["location"] ? {
              lat: place.dig("location", "latitude"),
              lng: place.dig("location", "longitude")
            } : nil
          }
        end
      }
    end
  end
end
