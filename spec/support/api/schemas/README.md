# API JSON Schema Validation

This directory contains JSON schemas for validating API responses in tests.

## Structure

Schemas are organized by controller and action:
```
schemas/
├── reports/
│   ├── create_success.json    # Success response for POST /api/v1/reports
│   └── validation_error.json  # Validation error responses
└── README.md
```

## Usage in Tests

### Basic Usage
```ruby
# In your request spec
expect(response).to match_json_schema("reports/create_success")
```

### Available Matchers
- `match_json_schema(schema_name)` - Main matcher
- `match_response_schema(schema_name)` - Alias for better readability

### Example Test
```ruby
it "returns valid JSON response" do
  post "/api/v1/reports", params: valid_params

  expect(response).to have_http_status(:created)
  expect(response).to match_json_schema("reports/create_success")
end
```

## Adding New Schemas

1. Create a new JSON file in the appropriate directory
2. Define the schema without the `$schema` field (causes compatibility issues)
3. Use in tests with `match_json_schema("path/to/schema")`

### Example Schema
```json
{
  "type": "object",
  "required": ["message"],
  "properties": {
    "message": {
      "type": "string",
      "description": "Success message"
    }
  },
  "additionalProperties": false
}
```

## Schema Patterns

### Validation Errors Schema
Handles field-specific and base errors:
```json
{
  "type": "object",
  "required": ["errors"],
  "properties": {
    "errors": {
      "type": "object",
      "patternProperties": {
        "^[a-z_]+$": {
          "type": "array",
          "items": {"type": "string"},
          "minItems": 1
        }
      }
    }
  }
}
```

## Benefits

- **Contract Testing**: Ensures API responses match expected format
- **Documentation**: Schemas serve as API documentation
- **Early Detection**: Catches breaking changes in API responses
- **Consistency**: Enforces consistent response formats across endpoints