class GoogleApis::OpeningHours::Sync < Micro::Case
  flow(
    GoogleApis::PlaceId::Process,
    GoogleApis::OpeningHours::Fetch,
    GoogleApis::OpeningHours::Process
  )
end
