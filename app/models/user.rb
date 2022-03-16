class User < ApplicationRecord
  devise :database_authenticatable,
    :omniauthable,
    :recoverable,
    :registerable,
    :rememberable,
    :validatable,
    omniauth_providers: %i[twitter]

  has_many :auth_providers

  def admin?
    role == "admin"
  end

  def moderator?
    role == "moderator"
  end

  def staff?
    admin? || moderator?
  end
end
