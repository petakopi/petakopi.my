FactoryBot.define do
  factory :collection do
    sequence(:name) { |n| "Collection #{n}" }
    association :user

    after(:build) do |collection|
      collection.set_slug
    end
  end
end
