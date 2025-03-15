// Service for fetching map data from the API
export const fetchMapData = async (userLocation) => {
  try {
    const url = new URL('/api/v1/maps', window.location.origin);

    // Add user location if available
    if (userLocation) {
      url.searchParams.append('lat', userLocation.latitude);
      url.searchParams.append('lng', userLocation.longitude);
    }

    console.log("Fetching shops for map from:", url.toString());
    const response = await fetch(url);
    const data = await response.json();
    console.log("API Response:", data);

    if (data && data.status === "success" && data.data && Array.isArray(data.data.coffee_shops)) {
      // Nested structure with status and data
      const fetchedShops = data.data.coffee_shops;
      console.log("Received shops:", fetchedShops.length);
      return {
        success: true,
        shops: fetchedShops
      };
    } else {
      console.error('Unexpected response format:', data);
      return {
        success: false,
        shops: [],
        error: 'Invalid response format'
      };
    }
  } catch (error) {
    console.error('Error fetching shops for map:', error);
    return {
      success: false,
      shops: [],
      error: error.message
    };
  }
};
