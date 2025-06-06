// Helper function to add filters to URL
export const applyFiltersToUrl = (url, filters) => {
  // Add keyword filter if it exists
  if (filters.keyword) {
    url.searchParams.append('keyword', filters.keyword);
  }

  // Add tags filter if it exists (multiple tags)
  if (filters.tags && filters.tags.length > 0) {
    filters.tags.forEach(tag => {
      url.searchParams.append('tags[]', tag);
    });
  }

  // Add state filter if it exists
  if (filters.state) {
    url.searchParams.append('state', filters.state);
  }

  // Add district filter if it exists
  if (filters.district) {
    url.searchParams.append('district', filters.district);
  }

  // Add opened filter if it exists
  if (filters.opened) {
    url.searchParams.append('opened', filters.opened);
  }

  // Add distance filter if it exists
  if (filters.distance) {
    url.searchParams.append('distance', filters.distance);
  }

  // Add rating filter if it exists
  if (filters.rating) {
    url.searchParams.append('rating', filters.rating);
  }

  // Add rating count filter if it exists
  if (filters.rating_count) {
    url.searchParams.append('rating_count', filters.rating_count);
  }

  // Add collection filter if it exists
  if (filters.collection_id) {
    url.searchParams.append('collection_id', filters.collection_id);
  }

  return url;
};

export const getActiveFilterCount = (filters, activeTab = 0) => {
  let count = 0;

  // Common filters for both tabs
  if (filters.opened) count++;
  if (filters.tags && filters.tags.length > 0) {
    count += filters.tags.length;
  }
  if (filters.rating) count++;
  if (filters.rating_count) count++;
  if (filters.collection_id) count++;

  // Explore tab specific filters (activeTab === 0)
  if (activeTab === 0) {
    if (filters.keyword) count++;
    if (filters.state) count++;
    if (filters.district) count++;
    if (filters.distance) count++;
  }

  return count;
};
