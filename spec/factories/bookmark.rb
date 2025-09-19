FactoryBot.define do
  factory :bookmark do
    association :user
    association :coffee_shop
  end
end