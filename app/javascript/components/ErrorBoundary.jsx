import React from "react"
import { useQueryErrorResetBoundary } from "@tanstack/react-query"

/**
 * Error boundary component for React Query errors
 * Follows React Query best practices for error handling
 */

class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error boundary caught error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback?.(this.state.error, this.props.reset) || (
          <DefaultErrorFallback
            error={this.state.error}
            reset={this.props.reset}
          />
        )
      )
    }

    return this.props.children
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null })
    }
  }
}

/**
 * Default error fallback component
 */
const DefaultErrorFallback = ({ error, reset }) => (
  <div className="p-8 text-center bg-red-50 border border-red-200 rounded-lg">
    <div className="text-red-600 mb-4">
      <svg
        className="mx-auto h-12 w-12"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    </div>

    <h3 className="text-lg font-medium text-gray-900 mb-2">
      Something went wrong
    </h3>

    <p className="text-gray-600 mb-4">
      {error?.message || "An unexpected error occurred"}
    </p>

    {reset && (
      <button
        onClick={reset}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
      >
        Try again
      </button>
    )}
  </div>
)

/**
 * Error boundary with React Query integration
 */
export const QueryErrorBoundary = ({ children, fallback }) => {
  const { reset, resetKey } = useQueryErrorResetBoundary()

  return (
    <ErrorBoundaryClass fallback={fallback} reset={reset} resetKey={resetKey}>
      {children}
    </ErrorBoundaryClass>
  )
}

/**
 * Simple error message component for query errors
 */
export const QueryError = ({ error, retry, className = "" }) => (
  <div
    className={`p-4 text-center bg-red-50 border border-red-200 rounded ${className}`}
  >
    <p className="text-red-600 mb-2">
      {error?.message || "Failed to load data"}
    </p>

    {retry && (
      <button
        onClick={retry}
        className="text-red-600 hover:text-red-700 underline text-sm"
      >
        Try again
      </button>
    )}
  </div>
)

/**
 * Loading spinner component
 */
export const QuerySpinner = ({ size = "medium", className = "" }) => {
  const sizeClasses = {
    small: "h-4 w-4",
    medium: "h-8 w-8",
    large: "h-12 w-12",
  }

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-2 border-brown-200 border-t-brown-600 ${sizeClasses[size]}`}
      />
    </div>
  )
}

export default QueryErrorBoundary
