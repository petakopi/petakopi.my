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
        google_locations: {
          administrative_area_level_1: params[:state],
          locality: params[:district]
        }
      )
    elsif params[:state].present? && params[:district].blank?
      relation.where(
        google_locations: {
          administrative_area_level_1: params[:state]
        }
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

  def reorder
    if params[:keyword].present? && params[:state].present?
      relation.order(:name, :district)
    elsif params[:keyword].present?
      relation.order(:name)
    elsif params[:keyword].blank? && params[:state].present?
      relation.order(:district, :name)
    else
      relation.order(approved_at: :desc)
    end
  end
end
