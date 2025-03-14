module AssetsHelper
  def optimized_blob_url(asset:, env: Rails.env, options: [])
    blob_path = rails_public_blob_url(asset)

    if env.production? && asset.image?
      [
        "https://assets.petakopi.my",
        "cdn-cgi/image",
        options.join(","),
        blob_path
      ].join("/")
    else
      blob_path
    end
  end
end
