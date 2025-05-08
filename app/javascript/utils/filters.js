// Helper function to add filters to URL
export const applyFiltersToUrl = (url, filters) => {
  // Add tags filter if it exists (multiple tags)
  if (filters.tags && filters.tags.length > 0) {
    filters.tags.forEach(tag => {
      url.searchParams.append('tags[]', tag);
    });
  }

  // Add opened filter if it exists
  if (filters.opened) {
    url.searchParams.append('opened', filters.opened);
  }

  return url;
};
