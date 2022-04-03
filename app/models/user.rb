class User < ApplicationRecord
  devise :database_authenticatable,
    :omniauthable,
    :recoverable,
    :registerable,
    :rememberable,
    :validatable,
    omniauth_providers: %i[facebook twitter google_oauth2]

  has_many :auth_providers
  has_many :submitted_coffee_shops, class_name: "CoffeeShop", foreign_key: "submitter_user_id"

  validates :username, uniqueness: true
  validates :username, presence: true
  validates :username, format: { with: /\A[a-z0-9]+\z/, message: "'%{value}' should only contain alphabets and numbers" }
  validates :username, length: { minimum: 5 }

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
