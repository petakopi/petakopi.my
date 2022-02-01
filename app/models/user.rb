class User < ApplicationRecord
  devise :database_authenticatable,
    :recoverable,
    :registerable,
    :rememberable,
    :validatable

  validates :name, uniqueness: true
end
