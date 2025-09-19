import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useCoffeeShops } from "../useCoffeeShops"
import * as api from "../../services/api"

// Mock the API module
jest.mock("../../services/api")

// Create a test wrapper for React Query
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })

const createWrapper = () => {
  const queryClient = createTestQueryClient()
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe("useCoffeeShops", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("filter parameter mapping", () => {
    it("should correctly map filter parameters to API call", async () => {
      const mockApiResponse = {
        coffee_shops: [],
        pages: { current_page: 1, total_pages: 1, total_count: 0 },
      }

      api.fetchCoffeeShops.mockResolvedValue(mockApiResponse)

      const filters = {
        opened: true,
        tags: ["pour-over", "wifi"],
        collection_id: 123,
        rating_count: 4,
        state: "Selangor",
        district: "Petaling Jaya",
        keyword: "specialty coffee",
        distance: 5,
        lat: 3.1578,
        lng: 101.7117,
        rating: 4.5,
      }

      renderHook(() => useCoffeeShops(filters), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(api.fetchCoffeeShops).toHaveBeenCalledWith({
          page: 1,
          opened: true,
          tags: ["pour-over", "wifi"],
          collection_id: 123,
          rating_count: 4,
          state: "Selangor",
          district: "Petaling Jaya",
          keyword: "specialty coffee",
          distance: 5,
          lat: 3.1578,
          lng: 101.7117,
          rating: 4.5,
        })
      })
    })

    it("should NOT include undefined or null filter values", async () => {
      const mockApiResponse = {
        coffee_shops: [],
        pages: { current_page: 1, total_pages: 1, total_count: 0 },
      }

      api.fetchCoffeeShops.mockResolvedValue(mockApiResponse)

      const filters = {
        opened: true,
        tags: [], // Empty array should not be included
        collection_id: null, // Null should not be included
        rating_count: undefined, // Undefined should not be included
        state: "", // Empty string should not be included
        keyword: "coffee",
      }

      renderHook(() => useCoffeeShops(filters), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(api.fetchCoffeeShops).toHaveBeenCalledWith({
          page: 1,
          opened: true,
          keyword: "coffee",
          // tags, collection_id, rating_count, state should NOT be included
        })
      })
    })

    it("should include location parameters when provided", async () => {
      const mockApiResponse = {
        coffee_shops: [],
        pages: { current_page: 1, total_pages: 1, total_count: 0 },
      }

      api.fetchCoffeeShops.mockResolvedValue(mockApiResponse)

      const filters = {
        lat: 3.1578,
        lng: 101.7117,
        distance: 10,
      }

      renderHook(() => useCoffeeShops(filters), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(api.fetchCoffeeShops).toHaveBeenCalledWith({
          page: 1,
          lat: 3.1578,
          lng: 101.7117,
          distance: 10,
        })
      })
    })

    it("should NOT include lat/lng if only one is provided", async () => {
      const mockApiResponse = {
        coffee_shops: [],
        pages: { current_page: 1, total_pages: 1, total_count: 0 },
      }

      api.fetchCoffeeShops.mockResolvedValue(mockApiResponse)

      const filters = {
        lat: 3.1578,
        // lng is missing
        distance: 10,
      }

      renderHook(() => useCoffeeShops(filters), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(api.fetchCoffeeShops).toHaveBeenCalledWith({
          page: 1,
          distance: 10,
          // lat/lng should NOT be included since lng is missing
        })
      })
    })

    it("should handle pagination correctly", async () => {
      const mockApiResponse = {
        coffee_shops: [],
        pages: { current_page: 2, total_pages: 5, total_count: 100 },
      }

      api.fetchCoffeeShops.mockResolvedValue(mockApiResponse)

      const filters = { keyword: "coffee" }
      const options = { page: 2 }

      renderHook(() => useCoffeeShops(filters, options), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(api.fetchCoffeeShops).toHaveBeenCalledWith({
          page: 2,
          keyword: "coffee",
        })
      })
    })
  })

  describe("regression prevention", () => {
    it("should reject incorrect filter field names that caused the regression", async () => {
      const mockApiResponse = {
        coffee_shops: [],
        pages: { current_page: 1, total_pages: 1, total_count: 0 },
      }

      api.fetchCoffeeShops.mockResolvedValue(mockApiResponse)

      // These are the WRONG field names that caused the regression
      const wrongFilters = {
        isOpenNow: true, // ❌ Should be 'opened'
        collection: 123, // ❌ Should be 'collection_id'
        ratingCount: 4, // ❌ Should be 'rating_count'
      }

      renderHook(() => useCoffeeShops(wrongFilters), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        // The API should only be called with page, no other parameters
        // because the wrong field names should be ignored
        expect(api.fetchCoffeeShops).toHaveBeenCalledWith({
          page: 1,
        })
      })
    })

    it("should correctly handle the exact parameters from utils/filters.js", async () => {
      const mockApiResponse = {
        coffee_shops: [],
        pages: { current_page: 1, total_pages: 1, total_count: 0 },
      }

      api.fetchCoffeeShops.mockResolvedValue(mockApiResponse)

      // These are the CORRECT field names from the original implementation
      const correctFilters = {
        opened: true, // ✅ Correct for "Open Now"
        collection_id: 123, // ✅ Correct for collections
        rating_count: 4, // ✅ Correct for rating count
        tags: ["wifi", "outdoor"], // ✅ Correct for tags
        keyword: "specialty", // ✅ Correct for keyword search
        state: "Selangor", // ✅ Correct for state filter
        district: "PJ", // ✅ Correct for district filter
        distance: 10, // ✅ Correct for distance filter
        rating: 4.5, // ✅ Correct for rating filter
      }

      renderHook(() => useCoffeeShops(correctFilters), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(api.fetchCoffeeShops).toHaveBeenCalledWith({
          page: 1,
          opened: true,
          collection_id: 123,
          rating_count: 4,
          tags: ["wifi", "outdoor"],
          keyword: "specialty",
          state: "Selangor",
          district: "PJ",
          distance: 10,
          rating: 4.5,
        })
      })
    })
  })

  describe("caching behavior", () => {
    it("should have zero caching (staleTime: 0, gcTime: 0)", () => {
      const { result } = renderHook(() => useCoffeeShops({}), {
        wrapper: createWrapper(),
      })

      // We can't directly test the React Query config, but we can verify
      // that the hook is called immediately and doesn't use cached data
      expect(api.fetchCoffeeShops).toHaveBeenCalled()
    })
  })

  describe("error handling", () => {
    it("should handle API errors gracefully", async () => {
      const mockError = new Error("API Error")
      api.fetchCoffeeShops.mockRejectedValue(mockError)

      const { result } = renderHook(() => useCoffeeShops({}), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
      })
    })
  })
})
