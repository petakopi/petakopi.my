require "sidekiq/testing"

RSpec.configure do |config|
  config.before(:each) do
    Sidekiq::Testing.fake!
  end

  config.after(:each) do
    Sidekiq::Worker.clear_all
  end
end
