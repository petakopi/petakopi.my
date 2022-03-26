class CoffeeShopConstraint
  def matches?(request)
    slug = request.params[:id]

    return false if slug.blank?

    CoffeeShop.where(slug: slug).exists?
  end
end
