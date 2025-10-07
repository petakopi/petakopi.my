class CoffeeShopsListQuery
  include Callable

  def initialize(params: {}, relation: CoffeeShop, current_user: nil)
    @params = params
    @relation = relation
    @current_user = current_user
  end

  def call
    @relation = apply_eager_loading
    @relation = filter_by_locations
    @relation = filter_by_keyword
    @relation = filter_by_tags
    @relation = filter_by_opening_status
    @relation = filter_by_distance
    @relation = filter_by_rating
    @relation = filter_by_rating_count
    @relation = filter_by_collection
    @relation = apply_distinct_if_needed
    @relation = reorder

    @relation
  end

  private

  attr_reader(
    :params,
    :relation,
    :current_user
  )

  def filter_by_locations
    if params[:state].present? && params[:district].present?
      relation.where(
        district: params[:district],
        state: params[:state]
      )
    elsif params[:state].present? && params[:district].blank?
      relation.where(
        state: params[:state]
      )
    else
      relation
    end
  end

  def filter_by_keyword
    return relation if params[:keyword].blank?

    keyword = "%#{params[:keyword].strip}%"

    relation.where("coffee_shops.name ILIKE ? OR coffee_shops.slug ILIKE ?", keyword, keyword)
  end

  def filter_by_tags
    return relation if params[:tags].blank?

    slugs = params[:tags].split(",")
    relation.joins(:tags).where(tags: {slug: slugs})
  end

  def filter_by_opening_status
    return relation unless params[:opened] == "true"

    # Get current day of week (0 = Sunday, 6 = Saturday)
    current_day = Time.current.wday

    # Convert to the format stored in the database (e.g., 1430 for 14:30)
    current_time_db_format = (Time.current.hour * 100) + Time.current.min

    # Find coffee shops that are currently open
    # This query handles several cases:
    # 1. Regular hours: start_day and close_day are the same, and current time is between start and close
    # 2. Overnight hours: start_day is before close_day, and either:
    #    a. We're on the start day and after start time, or
    #    b. We're on the close day and before close time
    relation.joins(:opening_hours).where(
      # Case 1: Same day opening hours (e.g., Monday 9:00 AM to Monday 5:00 PM)
      "(opening_hours.start_day = ? AND opening_hours.close_day = ? AND opening_hours.start_time <= ? AND opening_hours.close_time >= ?) OR " +
      # Case 2a: Overnight - we're on the start day (e.g., Monday 9:00 PM to Tuesday 2:00 AM, and it's Monday night)
      "(opening_hours.start_day = ? AND opening_hours.close_day != ? AND opening_hours.start_time <= ?) OR " +
      # Case 2b: Overnight - we're on the close day (e.g., Monday 9:00 PM to Tuesday 2:00 AM, and it's Tuesday morning)
      "(opening_hours.start_day != ? AND opening_hours.close_day = ? AND opening_hours.close_time >= ?)",
      current_day, current_day, current_time_db_format, current_time_db_format,
      current_day, current_day, current_time_db_format,
      current_day, current_day, current_time_db_format
    )
  end

  def filter_by_distance
    return relation unless has_location_params?

    DistanceFilterQuery.call(
      relation: relation,
      lat: params[:lat],
      lng: params[:lng],
      distance_in_km: params[:distance]
    )
  end

  def filter_by_rating
    return relation if params[:rating].blank?

    rating = params[:rating].to_f
    next_rating = rating + 0.2

    relation.where("rating >= ? AND rating < ?", rating, next_rating)
  end

  def filter_by_rating_count
    return relation if params[:rating_count].blank?

    count = params[:rating_count].to_i
    next_count =
      case count
      when 0..49 then 50
      when 50..99 then 100
      when 100..199 then 200
      when 200..299 then 300
      when 300..499 then 500
      end

    if next_count.nil?
      relation.where("rating_count >= ?", count)
    else
      relation.where("rating_count >= ? AND rating_count < ?", count, next_count)
    end
  end

  def filter_by_collection
    return relation if params[:collection_id].blank?
    return relation unless current_user

    relation.joins(bookmarks: :bookmark_collections)
      .where(
        bookmarks: {user_id: current_user.id},
        bookmark_collections: {collection_id: params[:collection_id]}
      )
  end

  def reorder
    if has_location_params?
      relation.order(Arel.sql("distance_in_km ASC"))
    elsif params[:keyword].present? && params[:state].present?
      relation.order(:name, :district)
    elsif params[:keyword].present?
      relation.order(:name)
    elsif params[:keyword].blank? && params[:state].present?
      relation.order(:district, :name)
    else
      relation.order(created_at: :desc)
    end
  end

  def apply_distinct_if_needed
    # Apply distinct only if we have joins and no distance filtering
    # Distance filtering always handles its own distinct logic via CTE
    if relation.respond_to?(:joins_values) && relation.joins_values.any? && !has_location_params?
      relation.distinct
    else
      relation
    end
  end

  def apply_eager_loading
    # Eager load attachments to prevent N+1 queries
    # This is applied early so DistanceFilterQuery can access it via the relation
    relation.includes(logo_attachment: :blob, cover_photo_attachment: :blob)
  end

  def has_location_params?
    params[:lat].present? &&
      params[:lng].present? &&
      params[:distance].present? &&
      valid_distance?
  end

  def valid_distance?
    return false unless params[:distance].present?

    distance = params[:distance].to_i
    distance > 0
  end
end
