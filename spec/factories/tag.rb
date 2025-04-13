FactoryBot.define do
  factory :tag do
    sequence(:name) { |n| "Tag #{n}" }
    sequence(:slug) { |n| "tag-#{n}" }
  end
end
