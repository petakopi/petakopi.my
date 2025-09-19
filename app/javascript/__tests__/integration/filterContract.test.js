/**
 * Integration tests to verify filter contracts between frontend and backend
 * These tests prevent regressions like the one we just fixed
 */

import { fetchCoffeeShops } from '../../services/api'
import { useCoffeeShops } from '../../hooks/useCoffeeShops'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock API
jest.mock('../../services/api')

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } }
  })
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('Filter Contract Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    fetchCoffeeShops.mockResolvedValue({
      coffee_shops: [],
      pages: { current_page: 1, total_pages: 1, total_count: 0 }
    })
  })

  describe('Contract Compliance: Original filter field names', () => {
    it('should match the original utils/filters.js contract', async () => {
      // These are the exact field names that the backend expects
      // Based on utils/filters.js from the original working implementation
      const originalFilters = {
        // Core filters
        keyword: 'specialty coffee',
        tags: ['wifi', 'pour-over', 'outdoor'],
        state: 'Selangor',
        district: 'Petaling Jaya',
        opened: true,          // ✅ "Open Now" filter
        distance: 5,
        rating: 4.5,
        rating_count: 10,      // ✅ Rating count filter
        collection_id: 123,    // ✅ Collection filter

        // Location
        lat: 3.1578,
        lng: 101.7117
      }

      renderHook(() => useCoffeeShops(originalFilters), {
        wrapper: createWrapper()
      })

      // Wait for the API call and verify exact parameter mapping
      expect(fetchCoffeeShops).toHaveBeenCalledWith({
        page: 1,
        keyword: 'specialty coffee',
        tags: ['wifi', 'pour-over', 'outdoor'],
        state: 'Selangor',
        district: 'Petaling Jaya',
        opened: true,
        distance: 5,
        rating: 4.5,
        rating_count: 10,
        collection_id: 123,
        lat: 3.1578,
        lng: 101.7117
      })
    })

    it('should REJECT the broken field names that caused the regression', async () => {
      // These are the WRONG field names that I accidentally used during refactoring
      const brokenFilters = {
        isOpenNow: true,        // ❌ Wrong - should be 'opened'
        collection: 123,        // ❌ Wrong - should be 'collection_id'
        ratingCount: 4,         // ❌ Wrong - should be 'rating_count'
        muslimFriendly: true,   // ❌ Wrong - not used in original
      }

      renderHook(() => useCoffeeShops(brokenFilters), {
        wrapper: createWrapper()
      })

      // These wrong field names should be completely ignored
      expect(fetchCoffeeShops).toHaveBeenCalledWith({
        page: 1
        // No other parameters should be included
      })
    })
  })

  describe('URL Parameter Format Compliance', () => {
    it('should generate URLs that match the original implementation', async () => {
      const filters = {
        keyword: 'coffee shop',
        tags: ['wifi', 'muslim-friendly'],
        opened: true,
        state: 'Kuala Lumpur',
        distance: 10,
        lat: 3.1578,
        lng: 101.7117
      }

      renderHook(() => useCoffeeShops(filters), {
        wrapper: createWrapper()
      })

      // Verify the fetch was called
      expect(fetchCoffeeShops).toHaveBeenCalled()

      // Get the actual URL that would be generated
      const calledParams = fetchCoffeeShops.mock.calls[0][0]

      // Verify specific format requirements
      expect(calledParams.keyword).toBe('coffee shop')
      expect(calledParams.tags).toEqual(['wifi', 'muslim-friendly'])
      expect(calledParams.opened).toBe(true)
      expect(calledParams.state).toBe('Kuala Lumpur')
      expect(calledParams.distance).toBe(10)
      expect(calledParams.lat).toBe(3.1578)
      expect(calledParams.lng).toBe(101.7117)
    })

    it('should handle special characters in parameters correctly', async () => {
      const filters = {
        keyword: 'café & bistro',
        state: 'Kuala Lumpur',
        district: 'Mont\'Kiara'
      }

      renderHook(() => useCoffeeShops(filters), {
        wrapper: createWrapper()
      })

      const calledParams = fetchCoffeeShops.mock.calls[0][0]

      expect(calledParams.keyword).toBe('café & bistro')
      expect(calledParams.state).toBe('Kuala Lumpur')
      expect(calledParams.district).toBe('Mont\'Kiara')
    })
  })

  describe('Regression Prevention Tests', () => {
    it('should maintain consistency with backend API expectations', async () => {
      // Test the exact scenario that broke: "Open Now" filter
      const openNowFilter = { opened: true }

      renderHook(() => useCoffeeShops(openNowFilter), {
        wrapper: createWrapper()
      })

      const calledParams = fetchCoffeeShops.mock.calls[0][0]
      expect(calledParams).toHaveProperty('opened', true)
      expect(calledParams).not.toHaveProperty('isOpenNow')
    })

    it('should maintain consistency for collection filters', async () => {
      // Test the exact scenario that broke: Collection filter
      const collectionFilter = { collection_id: 456 }

      renderHook(() => useCoffeeShops(collectionFilter), {
        wrapper: createWrapper()
      })

      const calledParams = fetchCoffeeShops.mock.calls[0][0]
      expect(calledParams).toHaveProperty('collection_id', 456)
      expect(calledParams).not.toHaveProperty('collection')
    })

    it('should maintain consistency for rating count filters', async () => {
      // Test the exact scenario that broke: Rating count filter
      const ratingCountFilter = { rating_count: 5 }

      renderHook(() => useCoffeeShops(ratingCountFilter), {
        wrapper: createWrapper()
      })

      const calledParams = fetchCoffeeShops.mock.calls[0][0]
      expect(calledParams).toHaveProperty('rating_count', 5)
      expect(calledParams).not.toHaveProperty('ratingCount')
    })

    it('should handle the complex filter combination that broke', async () => {
      // This is the exact combination that the user was testing when they found the bug
      const complexFilters = {
        opened: true,           // "Open Now" filter
        tags: ['pour-over'],    // Tags filter
        distance: 20,           // Distance filter
        lat: 3.1578,           // Location
        lng: 101.7117
      }

      renderHook(() => useCoffeeShops(complexFilters), {
        wrapper: createWrapper()
      })

      const calledParams = fetchCoffeeShops.mock.calls[0][0]

      // Verify all parameters are correctly mapped
      expect(calledParams.opened).toBe(true)
      expect(calledParams.tags).toEqual(['pour-over'])
      expect(calledParams.distance).toBe(20)
      expect(calledParams.lat).toBe(3.1578)
      expect(calledParams.lng).toBe(101.7117)

      // Verify the URL would include the correct parameters
      // This should generate: /api/v1/coffee_shops?page=1&opened=true&tags[]=pour-over&distance=20&lat=3.1578&lng=101.7117
    })
  })

  describe('Edge Cases That Could Break Again', () => {
    it('should handle empty arrays correctly', async () => {
      const filters = { tags: [] }

      renderHook(() => useCoffeeShops(filters), {
        wrapper: createWrapper()
      })

      const calledParams = fetchCoffeeShops.mock.calls[0][0]
      expect(calledParams).not.toHaveProperty('tags')
    })

    it('should handle null and undefined values correctly', async () => {
      const filters = {
        keyword: 'coffee',
        state: null,
        district: undefined,
        tags: []
      }

      renderHook(() => useCoffeeShops(filters), {
        wrapper: createWrapper()
      })

      const calledParams = fetchCoffeeShops.mock.calls[0][0]
      expect(calledParams).toEqual({
        page: 1,
        keyword: 'coffee'
      })
    })

    it('should handle incomplete location data correctly', async () => {
      // Only lat, no lng
      const filters1 = { lat: 3.1578 }

      renderHook(() => useCoffeeShops(filters1), {
        wrapper: createWrapper()
      })

      const calledParams1 = fetchCoffeeShops.mock.calls[0][0]
      expect(calledParams1).not.toHaveProperty('lat')
      expect(calledParams1).not.toHaveProperty('lng')

      // Clear and test only lng, no lat
      jest.clearAllMocks()
      fetchCoffeeShops.mockResolvedValue({
        coffee_shops: [],
        pages: { current_page: 1, total_pages: 1, total_count: 0 }
      })

      const filters2 = { lng: 101.7117 }

      renderHook(() => useCoffeeShops(filters2), {
        wrapper: createWrapper()
      })

      const calledParams2 = fetchCoffeeShops.mock.calls[0][0]
      expect(calledParams2).not.toHaveProperty('lat')
      expect(calledParams2).not.toHaveProperty('lng')
    })
  })
})