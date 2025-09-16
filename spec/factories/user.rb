FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "user#{n}@example.com" }
    sequence(:username) { |n| "user#{n}" }
    password { "password123" }
    password_confirmation { "password123" }
    role { "user" }

    trait :admin do
      role { "admin" }
    end

    trait :moderator do
      role { "moderator" }
    end
  end
end
