import { QueryClient } from '@tanstack/react-query'

/**
 * Query client configuration following React Query best practices
 */

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is fresh for 10 minutes (most app data doesn't change frequently)
      staleTime: 10 * 60 * 1000, // 10 minutes

      // Keep in cache for 30 minutes (longer than staleTime)
      gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)

      // Retry failed requests 3 times with exponential backoff
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        return failureCount < 3
      },

      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Don't refetch on window focus in development (annoying during dev)
      refetchOnWindowFocus: process.env.NODE_ENV === 'production',

      // Refetch on reconnect
      refetchOnReconnect: true,

      // Background refetch interval (30 minutes for fresh data)
      refetchInterval: 30 * 60 * 1000, // 30 minutes

      // Only refetch in background if page is visible
      refetchIntervalInBackground: false,
    },
    mutations: {
      // Retry mutations once
      retry: 1,

      // Mutation retry delay
      retryDelay: 1000,
    },
  },
})
