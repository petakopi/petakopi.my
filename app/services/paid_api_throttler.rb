class PaidApiThrottler
  def self.block_update_opening_hours?(coffee_shop)
    last_update =
      coffee_shop
        .opening_hours
        .order(updated_at: :desc)
        .first
        &.updated_at
        &.to_date

    last_update == Time.current.to_date
  end
end
