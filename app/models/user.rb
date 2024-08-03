class User < ApplicationRecord
  devise :database_authenticatable,
    :omniauthable,
    :recoverable,
    :registerable,
    :rememberable,
    :validatable,
    omniauth_providers: %i[facebook twitter google_oauth2]

  has_one_attached :avatar

  has_many :auth_providers
  has_many :bookmarks
  has_many :collections
  has_many :bookmark_coffee_shops, through: :bookmarks, source: :coffee_shop
  has_many :submitted_coffee_shops, class_name: "CoffeeShop", foreign_key: "submitter_user_id"
  has_many :coffee_shop_owners
  has_many :coffee_shops, through: :coffee_shop_owners
  has_many :check_ins, dependent: :destroy
  has_many :feedbacks

  validates :username, uniqueness: true
  validates :username, presence: true
  validates :username,
    format: {with: /\A[a-z0-9]+\z/, message: "'%{value}' should only contain alphabets (lower case) and numbers"}
  validates :username, length: {minimum: 5}

  after_save :process_avatar

  def admin?
    role == "admin"
  end

  def moderator?
    role == "moderator"
  end

  def staff?
    admin? || moderator?
  end

  def process_avatar
    return unless avatar.attached?
    return unless attachment_changes.dig("avatar").present?
    # hack to ensure we only do it if filename is not based on our custom format
    return if avatar.filename.to_s.match?(/#{id}-[0-9]+/)

    ProcessAvatarWorker.perform_in(2.minutes, id)
  end

  def checked_in?(coffee_shop)
    check_ins
      .where(
        coffee_shop: coffee_shop,
        created_at: Time.current.beginning_of_day..Time.current.end_of_day
      )
      .exists?
  end
end
