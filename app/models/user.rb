class User < ApplicationRecord
  devise :database_authenticatable,
    :recoverable,
    :registerable,
    :rememberable,
    :validatable
end
