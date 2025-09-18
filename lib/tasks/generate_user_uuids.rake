namespace :users do
  desc "Generate UUIDs for existing users that don't have one"
  task generate_uuids: :environment do
    users_without_uuid = User.where(uuid: nil)

    puts "Found #{users_without_uuid.count} users without UUIDs"

    users_without_uuid.find_each do |user|
      user.update!(uuid: UUID7.generate)
      puts "Generated UUID for user ID #{user.id}: #{user.uuid}"
    end

    puts "Completed generating UUIDs for all users"
  end
end
