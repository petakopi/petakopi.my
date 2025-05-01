class CoffeeShopsListQuery
  include Callable

  def initialize(params: {}, relation: CoffeeShop)
    @params = params
    @relation = relation
  end

  def call
    @relation = filter_by_locations
    @relation = filter_by_keyword
    @relation = filter_by_tags
    @relation = filter_by_opening_status

    @relation = reorder
  end

  private

  attr_reader(
    :params,
    :relation
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
    ).distinct
  end

  def reorder
    if params[:keyword].present? && params[:state].present?
      relation.order(:name, :district)
    elsif params[:keyword].present?
      relation.order(:name)
    elsif params[:keyword].blank? && params[:state].present?
      relation.order(:district, :name)
    else
      relation.order(created_at: :desc)
    end
  end
end
