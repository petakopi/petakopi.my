import {
  fetchCoffeeShops,
  fetchStates,
  fetchDistricts,
  fetchTags,
} from "../api"

// Mock fetch globally
global.fetch = jest.fn()

describe("API Service", () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  describe("fetchCoffeeShops", () => {
    it("should build correct URL with filter parameters", async () => {
      const mockResponse = {
        status: "success",
        data: {
          coffee_shops: [],
          pages: { current_page: 1, total_pages: 1, total_count: 0 },
        },
      }

      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const params = {
        page: 1,
        opened: true,
        tags: ["wifi", "outdoor"],
        collection_id: 123,
        rating_count: 4,
        state: "Selangor",
        district: "Petaling Jaya",
        keyword: "specialty coffee",
        distance: 10,
        lat: 3.1578,
        lng: 101.7117,
        rating: 4.5,
      }

      await fetchCoffeeShops(params)

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/coffee_shops"),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      )

      const calledUrl = fetch.mock.calls[0][0]
      const url = new URL(calledUrl)

      // Check individual parameters
      expect(url.searchParams.get("page")).toBe("1")
      expect(url.searchParams.get("opened")).toBe("true")
      expect(url.searchParams.get("collection_id")).toBe("123")
      expect(url.searchParams.get("rating_count")).toBe("4")
      expect(url.searchParams.get("state")).toBe("Selangor")
      expect(url.searchParams.get("district")).toBe("Petaling Jaya")
      expect(url.searchParams.get("keyword")).toBe("specialty coffee")
      expect(url.searchParams.get("distance")).toBe("10")
      expect(url.searchParams.get("lat")).toBe("3.1578")
      expect(url.searchParams.get("lng")).toBe("101.7117")
      expect(url.searchParams.get("rating")).toBe("4.5")

      // Check tags array parameters
      expect(url.searchParams.getAll("tags[]")).toEqual(["wifi", "outdoor"])
    })

    it("should handle array parameters correctly (tags)", async () => {
      const mockResponse = {
        status: "success",
        data: {
          coffee_shops: [],
          pages: { current_page: 1, total_pages: 1, total_count: 0 },
        },
      }

      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const params = {
        tags: ["pour-over", "wifi", "outdoor-seating"],
      }

      await fetchCoffeeShops(params)

      const calledUrl = fetch.mock.calls[0][0]
      const url = new URL(calledUrl)

      // Should create multiple tags[] parameters
      expect(url.searchParams.getAll("tags[]")).toEqual([
        "pour-over",
        "wifi",
        "outdoor-seating",
      ])
    })

    it("should skip undefined, null, and empty string parameters", async () => {
      const mockResponse = {
        status: "success",
        data: {
          coffee_shops: [],
          pages: { current_page: 1, total_pages: 1, total_count: 0 },
        },
      }

      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const params = {
        keyword: "coffee", // ✅ Should be included
        state: undefined, // ❌ Should be skipped
        district: null, // ❌ Should be skipped
        rating: "", // ❌ Should be skipped
        opened: true, // ✅ Should be included
      }

      await fetchCoffeeShops(params)

      const calledUrl = fetch.mock.calls[0][0]
      const url = new URL(calledUrl)

      expect(url.searchParams.get("keyword")).toBe("coffee")
      expect(url.searchParams.get("opened")).toBe("true")
      expect(url.searchParams.get("state")).toBeNull()
      expect(url.searchParams.get("district")).toBeNull()
      expect(url.searchParams.get("rating")).toBeNull()
    })

    it("should throw error for invalid response format", async () => {
      const invalidResponse = {
        status: "success",
        // Missing data.coffee_shops
        data: {},
      }

      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(invalidResponse),
      })

      await expect(fetchCoffeeShops({})).rejects.toThrow(
        "Invalid response format: missing coffee_shops data"
      )
    })

    it("should handle HTTP errors correctly", async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: () => Promise.resolve({ error: "Server Error" }),
      })

      await expect(fetchCoffeeShops({})).rejects.toThrow("Server Error")
    })

    it("should handle network errors correctly", async () => {
      fetch.mockRejectedValue(new Error("Network Error"))

      await expect(fetchCoffeeShops({})).rejects.toThrow("Network Error")
    })
  })

  describe("filter-specific API endpoints", () => {
    describe("fetchStates", () => {
      it("should call the correct endpoint for states", async () => {
        const mockResponse = ["Selangor", "Kuala Lumpur", "Johor"]

        fetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })

        await fetchStates()

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining("/api/v1/filters?section=states"),
          expect.any(Object)
        )
      })
    })

    describe("fetchDistricts", () => {
      it("should call the correct endpoint for districts with state parameter", async () => {
        const mockResponse = ["Petaling Jaya", "Shah Alam", "Subang Jaya"]

        fetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })

        await fetchDistricts("Selangor")

        const calledUrl = fetch.mock.calls[0][0]
        const url = new URL(calledUrl)

        expect(url.pathname).toBe("/api/v1/filters")
        expect(url.searchParams.get("section")).toBe("districts")
        expect(url.searchParams.get("state")).toBe("Selangor")
      })

      it("should return empty array when no state provided", async () => {
        const result = await fetchDistricts()
        expect(result).toEqual([])
        expect(fetch).not.toHaveBeenCalled()
      })
    })

    describe("fetchTags", () => {
      it("should call the correct endpoint for tags", async () => {
        const mockResponse = [
          { id: 1, name: "WiFi", slug: "wifi" },
          { id: 2, name: "Pour-over", slug: "pour-over" },
        ]

        fetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })

        await fetchTags()

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining("/api/v1/filters?section=tags"),
          expect.any(Object)
        )
      })
    })
  })

  describe("parameter encoding edge cases", () => {
    it("should properly encode special characters in parameters", async () => {
      const mockResponse = {
        status: "success",
        data: {
          coffee_shops: [],
          pages: { current_page: 1, total_pages: 1, total_count: 0 },
        },
      }

      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const params = {
        keyword: "café & coffee",
        state: "Kuala Lumpur",
        district: "Mont'Kiara",
      }

      await fetchCoffeeShops(params)

      const calledUrl = fetch.mock.calls[0][0]
      const url = new URL(calledUrl)

      expect(url.searchParams.get("keyword")).toBe("café & coffee")
      expect(url.searchParams.get("state")).toBe("Kuala Lumpur")
      expect(url.searchParams.get("district")).toBe("Mont'Kiara")
    })

    it("should handle numeric parameters correctly", async () => {
      const mockResponse = {
        status: "success",
        data: {
          coffee_shops: [],
          pages: { current_page: 1, total_pages: 1, total_count: 0 },
        },
      }

      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const params = {
        page: 1,
        distance: 5.5,
        lat: 3.1578,
        lng: 101.7117,
        rating: 4,
        rating_count: 10,
        collection_id: 123,
      }

      await fetchCoffeeShops(params)

      const calledUrl = fetch.mock.calls[0][0]
      const url = new URL(calledUrl)

      expect(url.searchParams.get("page")).toBe("1")
      expect(url.searchParams.get("distance")).toBe("5.5")
      expect(url.searchParams.get("lat")).toBe("3.1578")
      expect(url.searchParams.get("lng")).toBe("101.7117")
      expect(url.searchParams.get("rating")).toBe("4")
      expect(url.searchParams.get("rating_count")).toBe("10")
      expect(url.searchParams.get("collection_id")).toBe("123")
    })
  })
})
