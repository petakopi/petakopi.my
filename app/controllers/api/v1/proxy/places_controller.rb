class Api::V1::Proxy::PlacesController < ApiController
  # Expected User-Agent patterns for legitimate clients
  ALLOWED_USER_AGENTS = [
    /Expo/i,           # Expo/React Native apps
    /okhttp/i,         # Android HTTP client
    /CFNetwork/i,      # iOS network framework
    /darwin/i          # iOS/macOS
  ]

  # Rate limiting: 30 requests per minute per IP
  rate_limit to: 30, within: 1.minute, by: -> { request.remote_ip }, with: -> {
    render json: {error: "Rate limit exceeded. Please try again later."}, status: :too_many_requests
  }

  before_action :validate_client, only: [:search]

  def search
    result = GoogleApi::PlacesSearcher.call(query: params[:query])

    if result.success?
      render json: result.value!
    else
      render json: {error: result.failure}, status: :bad_request
    end
  end

  private

  def validate_client
    # In production, validate that the request comes from a legitimate client
    return true if Rails.env.development?
    return true if Rails.env.test?

    user_agent = request.user_agent.to_s

    # Check if User-Agent matches expected mobile app patterns
    unless ALLOWED_USER_AGENTS.any? { |pattern| user_agent.match?(pattern) }
      Rails.logger.warn("Places API: Unauthorized client - User-Agent: #{user_agent}, IP: #{request.remote_ip}")
      render json: {error: "Unauthorized client"}, status: :forbidden
      return false
    end

    true
  end
end
