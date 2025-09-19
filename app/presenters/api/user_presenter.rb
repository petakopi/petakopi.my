class Api::UserPresenter
  include Rails.application.routes.url_helpers

  def initialize(user)
    @user = user
  end

  def profile
    {
      id: @user.uuid,
      email: @user.email,
      username: @user.username,
      avatar_url: avatar_url
    }
  end

  private

  def avatar_url
    return nil unless @user.avatar.attached?

    if Rails.env.test?
      rails_blob_path(@user.avatar, only_path: true)
    else
      rails_public_blob_url(@user.avatar)
    end
  end
end
