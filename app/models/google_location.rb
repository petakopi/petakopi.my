class GoogleLocation < ApplicationRecord
  belongs_to :coffee_shop, touch: true

  validate :location_is_correct

  after_save :sync_with_google
  after_save :set_district_state

  NORMALIZED_NAMES = {
    "Federal Territory of Kuala Lumpur" => "Kuala Lumpur",
    "Labuan Federal Territory" => "Labuan",
    "Malacca" => "Melaka",
    "Penang" => "Pulau Pinang",
    "Wilayah Persekutuan Kuala Lumpur" => "Kuala Lumpur",
    "Wilayah Persekutuan Labuan" => "Labuan",
    "Wilayah Persekutuan Putrajaya" => "Putrajaya"
  }

  scope :within_bounding_box, ->(sw_lat, sw_lng, ne_lat, ne_lng) {
    where(
      "lat >= ? AND lat <= ? AND lng >= ? AND lng <= ?",
      sw_lat,
      ne_lat,
      sw_lng,
      ne_lng
    )
  }

  def state
    administrative_area_level_1
  end

  def district
    locality
  end

  def url
    if has_place_id?
      "https://www.google.com/maps/search/?api=1&query=#{lat},#{lng}&query_place_id=#{place_id}"
    else
      "https://www.google.com/maps/?q=#{lat},#{lng}"
    end
  end

  def has_place_id?
    place_id.present?
  end

  def set_district_state
    regions =
      GeoLocation.by_point.find_all_by_point(lng, lat).pluck(:kind, :name)

    coffee_shop.update(
      district: regions.select { |k, v| k == "region" }.flatten[1],
      state: regions.select { |k, v| k == "state" }.flatten[1]
    )
  end

  private

  def location_is_correct
    if lat.blank? || lng.blank?
      errors.add(:base, "missing lat/lng coordinates")
    end
  end

  def sync_with_google
    keys = ["place_id", "lat", "lng"]

    return unless saved_changes.keys.any? { |key| keys.include?(key) }

    GoogleApi::GoogleLocationSyncWorker.perform_async(id)
  end
end
