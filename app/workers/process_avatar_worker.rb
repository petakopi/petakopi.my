class ProcessAvatarWorker < SidekiqWorker
  def perform(user_id)
    user = User.find(user_id)

    AvatarProcessor.call(user: user)
  end
end
