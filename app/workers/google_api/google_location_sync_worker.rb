class GoogleApi::GoogleLocationSyncWorker < SidekiqWorker
  include Sidekiq::Throttled::Worker

  sidekiq_options retry: false
  sidekiq_throttle threshold: {limit: 200, period: 1.minute}

  def perform(google_location_id)
    google_location = GoogleLocation.find(google_location_id)

    result =
      GoogleApi::GoogleLocationSyncer.call(google_location: google_location)

    raise(result.failure) if result.failure?
  end
end
