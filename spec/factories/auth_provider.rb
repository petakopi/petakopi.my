FactoryBot.define do
  factory :auth_provider do
    association :user
    provider { "google_oauth2" }
    sequence(:uid) { |n| "uid_#{n}" }

    trait :apple do
      provider { "apple" }
      uid { "123456.abcdef1234567890abcdef1234567890.1234" }
    end

    trait :google do
      provider { "google_oauth2" }
      uid { "123456789" }
    end

    trait :facebook do
      provider { "facebook" }
      uid { "987654321" }
    end

    trait :twitter do
      provider { "twitter" }
      uid { "twitter_user_123" }
    end
  end
end
