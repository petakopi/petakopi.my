import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../lib/queryKeys'
import { fetchStates, fetchDistricts, fetchTags } from '../services/api'

/**
 * Hook for fetching states
 * States rarely change, so we can cache aggressively
 */
export const useStates = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.states(),
    queryFn: fetchStates,

    // States change very rarely
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days

    // Reduce network requests
    refetchOnWindowFocus: false,
    refetchOnMount: false,

    ...options,
  })
}

/**
 * Hook for fetching districts based on selected state
 * This is a dependent query - only runs when state is provided
 */
export const useDistricts = (state, options = {}) => {
  return useQuery({
    queryKey: queryKeys.districtsInState(state),
    queryFn: () => fetchDistricts(state),

    // Only run when state is provided
    enabled: !!state,

    // Districts for a state rarely change
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days

    // Reduce network requests
    refetchOnWindowFocus: false,

    ...options,
  })
}

/**
 * Hook for fetching public tags
 * Tags change infrequently, good candidate for aggressive caching
 */
export const useTags = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.tagsPublic(),
    queryFn: fetchTags,

    // Tags change infrequently
    staleTime: 12 * 60 * 60 * 1000, // 12 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days

    // Reduce network requests
    refetchOnWindowFocus: false,
    refetchOnMount: false,

    ...options,
  })
}

/**
 * Compound hook for all filter data
 * Useful when you need all filter options at once
 */
export const useAllFilters = (selectedState = null) => {
  const statesQuery = useStates()
  const districtsQuery = useDistricts(selectedState)
  const tagsQuery = useTags()

  return {
    states: {
      data: statesQuery.data,
      isLoading: statesQuery.isLoading,
      error: statesQuery.error,
    },
    districts: {
      data: districtsQuery.data,
      isLoading: districtsQuery.isLoading,
      error: districtsQuery.error,
    },
    tags: {
      data: tagsQuery.data,
      isLoading: tagsQuery.isLoading,
      error: tagsQuery.error,
    },
    isLoading: statesQuery.isLoading || tagsQuery.isLoading,
    hasError: !!(statesQuery.error || districtsQuery.error || tagsQuery.error),
  }
}
