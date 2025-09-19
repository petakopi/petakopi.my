import React from "react"

// React Query DevTools component for development
const ReactQueryDevtools = React.lazy(() =>
  import("@tanstack/react-query-devtools").then((d) => ({
    default: d.ReactQueryDevtools,
  }))
)

export default function ReactQueryDevtoolsWrapper() {
  // Only show devtools in development
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <React.Suspense fallback={null}>
      <ReactQueryDevtools initialIsOpen={false} />
    </React.Suspense>
  )
}
