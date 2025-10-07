module QueryCounter
  def count_queries(&block)
    count = 0
    counter = ->(*, payload) {
      count += 1 unless /SCHEMA|TRANSACTION/.match?(payload[:name])
    }

    ActiveSupport::Notifications.subscribed(counter, "sql.active_record", &block)
    count
  end
end

RSpec.configure do |config|
  config.include QueryCounter
end
