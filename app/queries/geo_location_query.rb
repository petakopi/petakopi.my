class GeoLocationQuery
  def initialize(relation = GeoLocation.all)
    @relation = relation
  end

  def find_all_by_point(lng, lat)
    @relation.where(
      "ST_Contains(geom, ST_SetSRID(ST_Point(?, ?), #{GeoLocation::SRID}))",
      lng,
      lat
    )
  end

  def find_district_by_point(lng, lat)
    @relation.districts.where(
      "ST_Contains(geom, ST_SetSRID(ST_Point(?, ?), #{GeoLocation::SRID}))",
      lng,
      lat
    ).first
  end

  def find_state_by_point(lng, lat)
    @relation.states.where(
      "ST_Contains(geom, ST_SetSRID(ST_Point(?, ?), #{GeoLocation::SRID}))",
      lng,
      lat
    ).first
  end
end
