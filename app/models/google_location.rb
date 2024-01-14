class GoogleLocation < ApplicationRecord
  belongs_to :coffee_shop

  validate :location_is_correct

  after_save :sync_with_google

  def state
    administrative_area_level_1
  end

  def district
    locality
  end

  def url
    if has_place_id?
      "https://www.google.com/maps/place/?q=place_id:#{place_id}"
    else
      "https://www.google.com/maps/?q=#{lat},#{lng}"
    end
  end

  def has_place_id?
    place_id.present?
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
