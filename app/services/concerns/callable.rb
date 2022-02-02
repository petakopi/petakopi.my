module Callable
  extend ActiveSupport::Concern

  class_methods do
    def call(args = nil)
      if args.nil?
        new.call
      elsif args.is_a? Hash
        new(**args).call
      else
        new(args).call
      end
    end
  end
end
