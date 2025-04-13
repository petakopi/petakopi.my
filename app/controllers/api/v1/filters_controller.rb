class Api::V1::FiltersController < ApiController
  def index
    section = params[:section]

    case section
    when "states"
      render json: fetch_states
    when "districts"
      state = params[:state]
      render json: fetch_districts(state)
    else
      render json: [], status: :bad_request
    end
  end

  private

  def fetch_states
    # Return distinct states from published coffee shops
    CoffeeShop.status_published.distinct.pluck(:state).compact.sort
  end

  def fetch_districts(state)
    return [] unless state.present?

    # Return distinct districts for the selected state from published coffee shops
    CoffeeShop.status_published.where(state: state).distinct.pluck(:district).compact.sort
  end
end
