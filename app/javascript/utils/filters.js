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

  return url;
};
