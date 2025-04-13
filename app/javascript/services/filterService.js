/**
 * Service for fetching filter data from the API
 */

/**
 * Fetches the list of states from the API
 *
 * @returns {Promise<Array<string>>} A promise that resolves to an array of state names
 * @throws {Error} If the API request fails
 */
export const fetchStates = async () => {
  try {
    const response = await fetch('/api/v1/filters?section=states');

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching states:', error);
    throw error;
  }
};

/**
 * Fetches the list of districts for a given state from the API
 *
 * @param {string} state - The state to fetch districts for
 * @returns {Promise<Array<string>>} A promise that resolves to an array of district names
 * @throws {Error} If the API request fails
 */
export const fetchDistricts = async (state) => {
  if (!state) return [];

  try {
    const response = await fetch(`/api/v1/filters?section=districts&state=${encodeURIComponent(state)}`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching districts for ${state}:`, error);
    throw error;
  }
};
