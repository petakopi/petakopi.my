class HashSerializer
  def self.dump(hash)
    hash.to_json
  end

  def self.load(hash)
    hash =
      if hash == {}
        hash
      elsif hash.nil?
        {}
      else
        JSON.parse(hash)
      end

    hash.with_indifferent_access
  end
end
