FactoryBot.define do
  factory :jwt_denylist do
    jti { "MyString" }
    exp { "2025-09-17 17:21:17" }
  end
end
