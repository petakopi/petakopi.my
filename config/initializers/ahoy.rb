class Ahoy::Store < Ahoy::DatabaseStore
end

# set to true for JavaScript tracking
Ahoy.api = true

# set to true for geocoding (and add the geocoder gem to your Gemfile)
# we recommend configuring local geocoding as well
# see https://github.com/ankane/ahoy#geocoding
Ahoy.geocode = false

Ahoy.server_side_visits = :when_needed

class Ahoy::Store < Ahoy::DatabaseStore
  def track_visit(data)
    data[:country] = request.headers["HTTP_CF_IPCOUNTRY"]
    super(data)
  end
end
