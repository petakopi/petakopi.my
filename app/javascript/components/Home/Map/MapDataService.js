// Service for fetching map data from the API

const CACHE_KEY = 'petakopi_map_data';
const CACHE_EXPIRY_MS = 60 * 60 * 1000; // 1 hour in milliseconds

// Check if we're in development mode
const isDevelopment = () => {
  return process.env.NODE_ENV === 'development' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';
};

// Helper function to check if cached data is valid
const isCacheValid = (cachedData) => {
  // Don't use cache in development
  if (isDevelopment()) return false;

  if (!cachedData || !cachedData.timestamp) return false;

  const now = new Date().getTime();
  const cacheAge = now - cachedData.timestamp;

  return cacheAge < CACHE_EXPIRY_MS;
};

// Helper function to save data to local storage
const saveToCache = (data, userLocationKey) => {
  // Don't cache in development
  if (isDevelopment()) return;

  const cacheData = {
    data: data,
    timestamp: new Date().getTime()
  };

  try {
    localStorage.setItem(`${CACHE_KEY}_${userLocationKey}`, JSON.stringify(cacheData));
  } catch (error) {
    // Silent error handling
  }
};

// Helper function to get cached data
const getFromCache = (userLocationKey) => {
  // Don't use cache in development
  if (isDevelopment()) return null;

  try {
    const cachedDataString = localStorage.getItem(`${CACHE_KEY}_${userLocationKey}`);
    if (!cachedDataString) return null;

    const cachedData = JSON.parse(cachedDataString);

    if (isCacheValid(cachedData)) {
      return cachedData.data;
    } else {
      // Clean up expired cache
      localStorage.removeItem(`${CACHE_KEY}_${userLocationKey}`);
      return null;
    }
  } catch (error) {
    return null;
  }
};

// Generate a cache key based on user location
const getUserLocationKey = (userLocation) => {
  if (!userLocation) return 'default';

  // Round coordinates to 2 decimal places for better cache hits
  // (small differences in exact coordinates shouldn't require new data)
  const lat = userLocation.latitude ? Math.round(userLocation.latitude * 100) / 100 : 'null';
  const lng = userLocation.longitude ? Math.round(userLocation.longitude * 100) / 100 : 'null';

  return `${lat}_${lng}`;
};

export const fetchMapData = async (userLocation) => {
  // Generate a cache key based on user location
  const userLocationKey = getUserLocationKey(userLocation);

  // Try to get data from cache first
  const cachedData = getFromCache(userLocationKey);
  if (cachedData) {
    return {
      success: true,
      shops: cachedData,
      fromCache: true
    };
  }

  // If no valid cache, fetch from API
  try {
    const url = new URL('/api/v1/maps', window.location.origin);

    // Add user location if available
    if (userLocation) {
      url.searchParams.append('lat', userLocation.latitude);
      url.searchParams.append('lng', userLocation.longitude);
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data && data.status === "success" && data.data && Array.isArray(data.data.coffee_shops)) {
      // Nested structure with status and data
      const fetchedShops = data.data.coffee_shops;

      // Save to cache
      saveToCache(fetchedShops, userLocationKey);

      return {
        success: true,
        shops: fetchedShops,
        fromCache: false
      };
    } else {
      return {
        success: false,
        shops: [],
        error: 'Invalid response format'
      };
    }
  } catch (error) {
    return {
      success: false,
      shops: [],
      error: error.message
    };
  }
};
