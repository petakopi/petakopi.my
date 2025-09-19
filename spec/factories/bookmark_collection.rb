FactoryBot.define do
  factory :bookmark_collection do
    association :bookmark
    association :collection
  end
end
