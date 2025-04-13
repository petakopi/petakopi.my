FactoryBot.define do
  factory :coffee_shop do
    sequence(:name) { |n| "Coffee Shop #{n}" }
    sequence(:slug) { |n| "coffee-shop-#{n}" }
    sequence(:uuid) { |n| "uuid-#{n}" }
    status { :published }
    state { "Selangor" }
    district { "Petaling" }
    urls {
      {
        facebook: "",
        instagram: "",
        tiktok: "",
        twitter: "",
        whatsapp: ""
      }
    }
  end
end
