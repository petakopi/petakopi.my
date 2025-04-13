FactoryBot.define do
  factory :opening_hour do
    coffee_shop
    start_day { 1 } # Monday
    start_time { 900 } # 9:00 AM
    close_day { 1 } # Monday
    close_time { 1700 } # 5:00 PM

    trait :same_day do
      start_day { 1 } # Monday
      start_time { 900 } # 9:00 AM
      close_day { 1 } # Monday
      close_time { 1700 } # 5:00 PM
    end

    trait :overnight do
      start_day { 1 } # Monday
      start_time { 1700 } # 5:00 PM
      close_day { 2 } # Tuesday
      close_time { 200 } # 2:00 AM
    end

    trait :sunday_overnight do
      start_day { 0 } # Sunday
      start_time { 2000 } # 8:00 PM
      close_day { 1 } # Monday
      close_time { 1200 } # 12:00 PM
    end

    trait :weekend do
      start_day { 6 } # Saturday
      start_time { 1000 } # 10:00 AM
      close_day { 6 } # Saturday
      close_time { 1800 } # 6:00 PM
    end
  end
end
