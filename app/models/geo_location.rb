class GeoLocation < ApplicationRecord
  SRID = 4326

  validates :name, presence: true
  validates :kind, presence: true
  validates :geom, presence: true

  scope :districts, -> { where(kind: "district") }
  scope :states, -> { where(kind: "state") }

  def self.by_point
    GeoLocationQuery.new
  end
end
