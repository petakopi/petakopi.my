# Handles distance-based filtering for coffee shops using PostGIS spatial functions
# Supports both simple queries and complex queries with joins using CTE
class DistanceFilterQuery
  include Callable

  def initialize(relation:, lat:, lng:, distance_in_km:)
    @relation = relation
    @lat = lat&.to_f
    @lng = lng&.to_f
    @distance_in_km = distance_in_km&.to_i
    @point = build_point_wkt if lat && lng
  end

  def call
    return relation unless valid_params?

    # Always use CTE approach for consistency and simplicity
    # This handles both simple and complex queries uniformly
    # Preserve includes from the relation by applying them after the CTE join
    result = CoffeeShop
      .with(filtered_shops: distance_subquery)
      .select("coffee_shops.*, filtered_shops.distance_in_km")
      .joins("INNER JOIN filtered_shops ON filtered_shops.id = coffee_shops.id")

    # Re-apply includes since CTE creates a new query
    if relation.includes_values.any?
      result.includes(*relation.includes_values)
    else
      result
    end
  end

  private

  attr_reader :relation, :lat, :lng, :distance_in_km, :point

  def valid_params?
    lat && lng && distance_in_km && distance_in_km > 0
  end

  def distance_subquery
    relation
      .select(
        "DISTINCT coffee_shops.id, " \
        "#{distance_calculation} as distance_in_km"
      )
      .where(
        "ST_DWithin(location, ST_SetSRID(ST_GeomFromText(?), 4326), ?)",
        point,
        distance_in_meters
      )
  end

  def distance_calculation
    "ST_Distance(location, ST_SetSRID(ST_GeomFromText('#{point}'), 4326)) / 1000"
  end

  def distance_in_meters
    distance_in_km * 1000
  end

  def build_point_wkt
    "POINT(#{lng} #{lat})"
  end
end
