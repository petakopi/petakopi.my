class DisplayOpeningHoursQuery
  def initialize(relation:)
    @relation = relation
  end

  def list
    @relation
      .opening_hours
      .order(:day, :time)
      .group_by { |x| x.day }
      .map { |x| x.last.each_slice(2) }
  end
end
