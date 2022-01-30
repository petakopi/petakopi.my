class Location < ApplicationRecord
  def self.states
    Rails.cache.fetch("location:states:*", expires: 1.day) do
      Location.distinct.pluck(:state).sort
    end
  end

  def self.districts(state:)
    Rails.cache.fetch("location:#{state}:districts:*", expires: 1.day) do
      Location.where(state: state).distinct.pluck(:city).sort
    end
  end
end
