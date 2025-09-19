/**
 * Custom React Query hooks for API data fetching
 * Centralizes all API calls and caching logic
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

// API base URL
const API_BASE = "/api/v1"

// Query key factories for consistent cache keys
export const queryKeys = {
  all: ["api"],
  coffeeShops: {
    all: ["api", "coffeeShops"],
    list: (filters) => ["api", "coffeeShops", "list", filters],
    detail: (id) => ["api", "coffeeShops", "detail", id],
    map: (filters) => ["api", "coffeeShops", "map", filters],
  },
  filters: {
    all: ["api", "filters"],
    states: ["api", "filters", "states"],
    districts: (state) => ["api", "filters", "districts", state],
    tags: ["api", "filters", "tags"],
  },
}

// Helper function to build URL with query params
const buildUrl = (path, params = {}) => {
  const url = new URL(`${API_BASE}${path}`, window.location.origin)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, String(value))
    }
  })
  return url.toString()
}

/**
 * Hook for fetching coffee shops list with pagination and filters
 */
export const useCoffeeShops = ({
  page = 1,
  distance,
  lat,
  lng,
  keyword,
  state,
  district,
  tags = [],
  muslimFriendly,
  rating,
  ratingCount,
  isOpenNow,
  collection,
  enabled = true,
}) => {
  const filters = {
    page,
    distance,
    lat,
    lng,
    keyword,
    state,
    district,
    tags: tags.join(","),
    muslim_friendly: muslimFriendly,
    rating,
    rating_count: ratingCount,
    is_open_now: isOpenNow,
    collection,
  }

  // Remove empty values
  Object.keys(filters).forEach((key) => {
    if (
      filters[key] === undefined ||
      filters[key] === null ||
      filters[key] === ""
    ) {
      delete filters[key]
    }
  })

  return useQuery({
    queryKey: queryKeys.coffeeShops.list(filters),
    queryFn: async () => {
      const response = await fetch(buildUrl("/coffee_shops", filters))
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const data = await response.json()
      return data.data // Return the nested data object
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    keepPreviousData: true, // Keep previous data while fetching new page
  })
}

/**
 * Hook for fetching map data (all coffee shops for map view)
 */
export const useMapCoffeeShops = ({
  lat,
  lng,
  filters = {},
  enabled = true,
}) => {
  const mapFilters = {
    ...filters,
    lat,
    lng,
    view: "map", // Special parameter for map view
  }

  return useQuery({
    queryKey: queryKeys.coffeeShops.map(mapFilters),
    queryFn: async () => {
      const response = await fetch(buildUrl("/coffee_shops/map", mapFilters))
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const data = await response.json()
      return data.data
    },
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes for map data
    cacheTime: 60 * 60 * 1000, // 1 hour
  })
}

/**
 * Hook for fetching states
 */
export const useStates = () => {
  return useQuery({
    queryKey: queryKeys.filters.states,
    queryFn: async () => {
      const response = await fetch(buildUrl("/filters", { section: "states" }))
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    },
    staleTime: 6 * 60 * 60 * 1000, // 6 hours
    cacheTime: 6 * 60 * 60 * 1000, // 6 hours
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook for fetching districts based on selected state
 */
export const useDistricts = (state) => {
  return useQuery({
    queryKey: queryKeys.filters.districts(state),
    queryFn: async () => {
      if (!state) return []
      const response = await fetch(
        buildUrl("/filters", { section: "districts", state })
      )
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    },
    enabled: !!state,
    staleTime: 6 * 60 * 60 * 1000, // 6 hours
    cacheTime: 6 * 60 * 60 * 1000, // 6 hours
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook for fetching tags
 */
export const useTags = () => {
  return useQuery({
    queryKey: queryKeys.filters.tags,
    queryFn: async () => {
      const response = await fetch(buildUrl("/filters", { section: "tags" }))
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    },
    staleTime: 6 * 60 * 60 * 1000, // 6 hours
    cacheTime: 6 * 60 * 60 * 1000, // 6 hours
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook for creating a new coffee shop
 */
export const useCreateCoffeeShop = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (coffeeShopData) => {
      const response = await fetch(buildUrl("/coffee_shops"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(coffeeShopData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(
          error.message || `HTTP error! Status: ${response.status}`
        )
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate coffee shops list to refetch with new data
      queryClient.invalidateQueries(queryKeys.coffeeShops.all)
    },
  })
}

/**
 * Hook for submitting a report
 */
export const useSubmitReport = () => {
  return useMutation({
    mutationFn: async (reportData) => {
      const response = await fetch(buildUrl("/reports"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(
          error.message || `HTTP error! Status: ${response.status}`
        )
      }

      return response.json()
    },
  })
}

/**
 * Hook to prefetch coffee shops for better UX
 */
export const usePrefetchCoffeeShops = () => {
  const queryClient = useQueryClient()

  return (filters) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.coffeeShops.list(filters),
      queryFn: async () => {
        const response = await fetch(buildUrl("/coffee_shops", filters))
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        const data = await response.json()
        return data.data
      },
      staleTime: 5 * 60 * 1000,
    })
  }
}

/**
 * Hook to invalidate and refetch data
 */
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient()

  return {
    invalidateAll: () => queryClient.invalidateQueries(queryKeys.all),
    invalidateCoffeeShops: () =>
      queryClient.invalidateQueries(queryKeys.coffeeShops.all),
    invalidateFilters: () =>
      queryClient.invalidateQueries(queryKeys.filters.all),
  }
}
