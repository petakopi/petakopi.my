class UsernameGeneratorService
  include Callable

  def initialize(email:)
    @email = email
  end

  def call
    base_username = @email.split("@").first.downcase.gsub(/[^a-z0-9]/, "")

    # Handle short or empty usernames
    if base_username.blank?
      base_username = "user12345"
    elsif base_username.length < 5
      base_username = "#{base_username}12345"[0, 10]
    end

    # Truncate long usernames
    base_username = base_username[0, 10] if base_username.length > 10

    username = base_username
    counter = 1

    while User.exists?(username: username)
      counter_str = counter.to_s
      max_base_length = 10 - counter_str.length
      truncated_base = base_username[0, max_base_length]
      username = "#{truncated_base}#{counter}"
      counter += 1
    end

    username
  end

  private

  attr_reader :email
end
