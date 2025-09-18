class OmniauthHandler
  include Callable

  def initialize(payload:)
    @payload = payload
  end

  def call
    set_data
    set_user
    set_omniauth

    user
  end

  private

  attr_reader(
    :email,
    :name,
    :payload,
    :provider,
    :uid,
    :user
  )

  def set_data
    @provider = payload.dig("provider")
    @uid = payload.dig("uid")
    @email = payload.dig("info", "email")
    @name = payload.dig("info", "name")
  end

  def set_user
    @user = User.find_by(email: email)

    return if @user.present?

    @user =
      User.create(
        email: email,
        password: Devise.friendly_token[0, 20],
        username: UsernameGeneratorService.call(email: email)
      )
  end

  def set_omniauth
    user
      .auth_providers
      .where(auth_providers: {provider: provider})
      .first_or_create do |auth_provider|
        auth_provider.provider = provider
        auth_provider.uid = uid
      end
  end
end
