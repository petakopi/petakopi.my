class User < ApplicationRecord
  devise :database_authenticatable,
    :omniauthable,
    :recoverable,
    :registerable,
    :rememberable,
    :validatable,
    omniauth_providers: %i[twitter]

  has_many :auth_providers

  validates :username, uniqueness: true
  validates :username, presence: true
  validates :username, format: { with: /\A[a-z0-9]+\z/, message: "'%{value}' should only contain alphabets and numbers" }

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
