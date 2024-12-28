class Admin::CoffeeShopOwnersController < AdminController
  before_action :set_coffee_shop_owner, only: %i[destroy]

  def index
    @coffee_shop_owners = CoffeeShopOwner.includes(:coffee_shop, :user).all
  end

  def new
    @coffee_shop_owner = CoffeeShopOwner.new
    set_data
  end

  def create
    @coffee_shop_owner = CoffeeShopOwner.new(coffee_shop_owner_params)

    if @coffee_shop_owner.save
      redirect_to admin_coffee_shop_owners_url,
        notice: "Coffee shop owner was successfully created."
    else
      set_data
      render :new, status: :unprocessable_entity
    end
  end

  # DELETE /coffee_shop_owners/1 or /coffee_shop_owners/1.json
  def destroy
    @coffee_shop_owner.destroy!

    redirect_to admin_coffee_shop_owners_url,
      notice: "Coffee shop owner was successfully destroyed."
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_coffee_shop_owner
    @coffee_shop_owner = CoffeeShopOwner.find(params[:id])
  end

  # Only allow a list of trusted parameters through.
  def coffee_shop_owner_params
    params.require(:coffee_shop_owner).permit(:coffee_shop_id, :user_id)
  end

  def set_data
    @coffee_shops =
      CoffeeShop
        .status_published
        .select(:id, :name, :slug)
        .map do |cs|
          [
            "#{cs.name} - #{cs.slug}",
            cs.id
          ]
        end
    @users = User.select(:email, :id).map { |user| [user.email, user.id] }
  end
end
