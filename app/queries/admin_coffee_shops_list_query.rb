class AdminCoffeeShopsListQuery
  include Callable

  def initialize(params: {}, relation: CoffeeShop)
    @params = params
    @relation = relation
  end

  def call
    @relation = filter_by_status
    @relation = filter_by_keyword
    @relation = reorder

    @relation
  end

  private

  attr_reader(
    :params,
    :relation
  )

  def filter_by_status
    # High priority since it's submitted by a non admin and has the name
    if params[:status].present? && params[:status] == "status_must_review"
      relation
        .status_unpublished
        .where.not(name: nil)
        .where(users: { role: nil })
    elsif params[:status].present?
      relation
        .public_send(params[:status])
    else
      relation
    end
  end

  def filter_by_keyword
    return relation if params[:keyword].blank?

    keyword = "%#{params[:keyword]}%"

    relation.where("name ILIKE ? OR slug ILIKE ?", keyword, keyword)
  end

  def reorder
    if params[:status] == "status_published"
      relation.order(approved_at: :desc)
    else
      relation.order(created_at: :desc)
    end
  end
end
