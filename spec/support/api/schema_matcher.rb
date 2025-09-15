require "json"
require "json-schema"

RSpec::Matchers.define :match_json_schema do |schema_name|
  match do |response|
    schema_path = Rails.root.join("spec", "support", "api", "schemas", "#{schema_name}.json")

    unless File.exist?(schema_path)
      raise "Schema file not found: #{schema_path}"
    end

    schema = JSON.parse(File.read(schema_path))

    # Parse response body
    json_body = if response.is_a?(String)
      JSON.parse(response)
    elsif response.respond_to?(:body)
      JSON.parse(response.body)
    else
      response
    end

    # Validate against schema
    errors = JSON::Validator.fully_validate(schema, json_body)

    # Store errors for failure message
    @validation_errors = errors if errors.any?

    errors.empty?
  end

  failure_message do |response|
    "Expected response to match JSON schema '#{schema_name}':\n" +
    "Validation errors:\n#{@validation_errors.join("\n")}\n\n" +
    "Response body:\n#{JSON.pretty_generate(JSON.parse(response.body))}"
  end

  failure_message_when_negated do |response|
    "Expected response not to match JSON schema '#{schema_name}'"
  end

  description do
    "match JSON schema '#{schema_name}'"
  end
end

# Helper method for better readability
def match_response_schema(schema_name)
  match_json_schema(schema_name)
end