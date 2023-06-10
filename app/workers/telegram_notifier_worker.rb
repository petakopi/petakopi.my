require "telegram/bot"

class TelegramNotifierWorker < SidekiqWorker
  def perform(message)
    Telegram::Bot::Client.run(Rails.application.credentials[:telegram][:bot_token]) do |bot|
      bot.api.send_message(chat_id: Rails.application.credentials[:telegram][:notification_chat_id], text: message)
    end
  end
end
