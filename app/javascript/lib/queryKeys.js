/**
 * Query key factory following React Query best practices
 * https://tkdodo.eu/blog/effective-react-query-keys
 */

export const queryKeys = {
  // Top-level keys
  all: ['petakopi'],

  // Coffee shops
  coffeeShops: () => [...queryKeys.all, 'coffee-shops'],
  coffeeShop: (id) => [...queryKeys.coffeeShops(), 'detail', id],
  coffeeShopsList: () => [...queryKeys.coffeeShops(), 'list'],
  coffeeShopsListFiltered: (filters) => [...queryKeys.coffeeShopsList(), { filters }],
  coffeeShopsMap: () => [...queryKeys.coffeeShops(), 'map'],
  coffeeShopsMapFiltered: (filters) => [...queryKeys.coffeeShopsMap(), { filters }],

  // Filters
  filters: () => [...queryKeys.all, 'filters'],

  // States
  states: () => [...queryKeys.filters(), 'states'],

  // Districts (dependent on state)
  districts: () => [...queryKeys.filters(), 'districts'],
  districtsInState: (state) => [...queryKeys.districts(), { state }],

  // Tags
  tags: () => [...queryKeys.filters(), 'tags'],
  tagsPublic: () => [...queryKeys.tags(), 'public'],

  // Collections
  collections: () => [...queryKeys.all, 'collections'],
}
