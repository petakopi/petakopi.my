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
    if params[:status].present?
      relation.public_send(params[:status])
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
