/**
 * API service layer - Pure functions for API calls
 * Separated from React Query hooks for better testability
 */

const API_BASE = "/api/v1"

// Helper to build URLs with query parameters
const buildApiUrl = (endpoint, params = {}) => {
  const url = new URL(`${API_BASE}${endpoint}`, window.location.origin)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((v) => url.searchParams.append(`${key}[]`, String(v)))
      } else {
        url.searchParams.append(key, String(value))
      }
    }
  })

  return url.toString()
}

// Generic fetch wrapper with error handling
const apiCall = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = new Error(`API call failed: ${response.status}`)
    error.status = response.status
    error.statusText = response.statusText

    try {
      const errorData = await response.json()
      error.message = errorData.error || error.message
    } catch {
      // If response is not JSON, keep the default error message
    }

    throw error
  }

  return response.json()
}

// ==================== COFFEE SHOPS ====================

export const fetchCoffeeShops = async (params = {}) => {
  const url = buildApiUrl("/coffee_shops", params)
  const data = await apiCall(url)

  // Validate response structure
  if (!data.data?.coffee_shops) {
    throw new Error("Invalid response format: missing coffee_shops data")
  }

  return data.data // Return the nested data object
}

export const fetchCoffeeShop = async (id) => {
  const url = buildApiUrl(`/coffee_shops/${id}`)
  return apiCall(url)
}

export const createCoffeeShop = async (coffeeShopData) => {
  const url = buildApiUrl("/coffee_shops")
  return apiCall(url, {
    method: "POST",
    body: JSON.stringify(coffeeShopData),
  })
}

// ==================== FILTERS ====================

export const fetchStates = async () => {
  const url = buildApiUrl("/filters", { section: "states" })
  return apiCall(url)
}

export const fetchDistricts = async (state) => {
  if (!state) return []

  const url = buildApiUrl("/filters", { section: "districts", state })
  return apiCall(url)
}

export const fetchTags = async () => {
  const url = buildApiUrl("/filters", { section: "tags" })
  return apiCall(url)
}

// ==================== REPORTS ====================

export const submitReport = async (reportData) => {
  const url = buildApiUrl("/reports")
  return apiCall(url, {
    method: "POST",
    body: JSON.stringify(reportData),
  })
}
