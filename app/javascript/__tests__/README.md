# JavaScript Testing Setup

This directory contains tests for our React components and API layer, specifically focused on preventing filter-related regressions.

## Setup

Tests use Jest with React Testing Library. Run with:

```bash
pnpm test                 # Run all tests
pnpm test:watch          # Run in watch mode
pnpm test:coverage       # Run with coverage report
```

## Test Structure

### `hooks/__tests__/`
Tests for React Query hooks, particularly `useCoffeeShops` which manages coffee shop data fetching and filtering.

### `services/__tests__/`
Tests for API service layer, ensuring correct URL building and parameter handling.

### `__tests__/integration/`
Integration tests that verify the complete filter flow from React components to API calls.

## Key Test Coverage

### Filter Parameter Mapping
- Verifies correct field names are used (`opened` not `isOpenNow`)
- Tests array parameter handling (`tags[]`)
- Validates location parameter logic

### Regression Prevention
- Prevents the filter field name regression that broke "Apply Filters"
- Ensures backend API contract compliance
- Tests edge cases (null values, empty arrays, incomplete location data)

### Contract Testing
- Validates that frontend sends parameters backend expects
- Tests URL encoding for special characters
- Verifies pagination handling

## Why These Tests Matter

These tests specifically prevent the regression where filter parameters had incorrect field names, causing "Apply Filters" to not work. The tests ensure:

1. **Field name consistency**: `opened` not `isOpenNow`, `collection_id` not `collection`
2. **Parameter format**: Arrays use `tags[]` format, not `tags`
3. **Contract compliance**: Frontend matches backend expectations exactly

## Test Philosophy

- **Unit tests** verify individual functions work correctly
- **Integration tests** verify the complete filter flow works end-to-end
- **Contract tests** prevent frontend/backend parameter mismatches
- **Regression tests** prevent previously fixed bugs from reoccurring