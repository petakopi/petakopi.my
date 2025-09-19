import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "../lib/queryKeys"
import {
  fetchCoffeeShops,
  fetchCoffeeShop,
  createCoffeeShop,
} from "../services/api"

/**
 * Hook for fetching paginated coffee shops with filters
 * Follows React Query best practices for pagination
 */
export const useCoffeeShops = (filters = {}, options = {}) => {
  const { page = 1, enabled = true, ...queryOptions } = options

  // Clean filters object (remove undefined/null values) - use filters parameter directly
  // Match the original filter field names from utils/filters.js
  const cleanFilters = {
    page,
    ...(filters.distance && { distance: filters.distance }),
    ...(filters.lat && filters.lng && { lat: filters.lat, lng: filters.lng }),
    ...(filters.keyword && { keyword: filters.keyword }),
    ...(filters.state && { state: filters.state }),
    ...(filters.district && { district: filters.district }),
    ...(filters.tags?.length > 0 && { tags: filters.tags }),
    ...(filters.rating && { rating: filters.rating }),
    ...(filters.rating_count && { rating_count: filters.rating_count }),
    ...(filters.opened && { opened: filters.opened }),
    ...(filters.collection_id && { collection_id: filters.collection_id }),
  }

  return useQuery({
    queryKey: queryKeys.coffeeShopsListFiltered(cleanFilters),
    queryFn: () => fetchCoffeeShops(cleanFilters),
    enabled,

    // Keep previous data during pagination only (not when filters change)
    placeholderData: (previousData, previousQuery) => {
      // Only keep previous data if it's the same query with different page
      const prevFilters = previousQuery?.queryKey?.[2] || {}
      const currentFiltersWithoutPage = { ...cleanFilters }
      const prevFiltersWithoutPage = { ...prevFilters }

      delete currentFiltersWithoutPage.page
      delete prevFiltersWithoutPage.page

      // If filters are the same (only page changed), keep previous data
      if (
        JSON.stringify(currentFiltersWithoutPage) ===
        JSON.stringify(prevFiltersWithoutPage)
      ) {
        return previousData
      }

      // If filters changed, don't keep previous data (force loading state)
      return undefined
    },

    // Never cache search results - always fetch fresh data
    staleTime: 0, // Always consider stale - refetch immediately
    gcTime: 0, // Don't cache at all - immediate garbage collection

    ...queryOptions,
  })
}

/**
 * Hook for fetching a single coffee shop
 */
export const useCoffeeShop = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.coffeeShop(id),
    queryFn: () => fetchCoffeeShop(id),
    enabled: !!id,

    // Individual coffee shop data is more stable than search results
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes

    ...options,
  })
}

/**
 * Mutation hook for creating coffee shops
 * Includes optimistic updates and cache invalidation
 */
export const useCreateCoffeeShop = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCoffeeShop,

    onSuccess: (newCoffeeShop) => {
      // Invalidate coffee shops list to refetch with new data
      queryClient.invalidateQueries({
        queryKey: queryKeys.coffeeShopsList(),
      })

      // Optionally, set the new coffee shop in cache
      if (newCoffeeShop?.uuid) {
        queryClient.setQueryData(
          queryKeys.coffeeShop(newCoffeeShop.uuid),
          newCoffeeShop
        )
      }
    },

    onError: (error) => {
      // Error handling can be done at component level
      console.error("Failed to create coffee shop:", error)
    },
  })
}

/**
 * Hook to prefetch coffee shops for better UX
 * Useful for predictive loading
 */
export const usePrefetchCoffeeShops = () => {
  const queryClient = useQueryClient()

  return (filters = {}) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.coffeeShopsListFiltered(filters),
      queryFn: () => fetchCoffeeShops(filters),
      staleTime: 5 * 60 * 1000,
    })
  }
}
