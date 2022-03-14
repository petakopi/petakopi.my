def populate_missing_lat_lng
  remote.rails("data:populate_missing_lat_lng")
end

def refresh_sitemap
  remote.rails("sitemap:refresh")
end
