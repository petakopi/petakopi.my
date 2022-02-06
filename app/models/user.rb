class User < ApplicationRecord
  devise :database_authenticatable,
    :recoverable,
    :registerable,
    :rememberable,
    :validatable

  validates :name, uniqueness: true

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
