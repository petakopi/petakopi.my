// Handles map events and shop visibility logic
export const setupMapEventHandlers = (map, shops, setVisibleShops, setHasClusters, mapLoaded) => {
  if (!map) return;

  // Combined handler for both moveend and zoomend events
  const updateVisibleShops = () => {
    console.log("=== MAP VIEW CHANGED ===");

    if (!map || !mapLoaded) {
      console.log("Map not ready for querying features");
      return;
    }

    try {
      // Get the current map bounds
      const bounds = map.getBounds();
      console.log("Current map bounds:", bounds.toArray());

      // Get the current zoom level
      const zoom = map.getZoom();
      console.log("Current zoom level:", zoom);

      // First check for unclustered points (individual markers)
      const visibleMarkers = map.queryRenderedFeatures({
        layers: ['unclustered-point']
      });
      console.log("Visible unclustered markers:", visibleMarkers.length);

      // Then check for clusters
      const visibleClusters = map.queryRenderedFeatures({
        layers: ['clusters']
      });
      console.log("Visible clusters:", visibleClusters.length);

      // Update clusters state - force to true for testing
      setHasClusters(visibleClusters.length > 0);
      console.log("Setting hasClusters to:", visibleClusters.length > 0);

      // If we have visible unclustered markers, use those directly
      if (visibleMarkers.length > 0) {
        // Extract shop IDs from markers
        const visibleShopIds = visibleMarkers.map(marker => {
          const id = marker.properties.id;
          return typeof id === 'string' ? parseInt(id, 10) : id;
        });

        console.log("Visible shop IDs from markers:", visibleShopIds);

        // Find matching shops from our shops array
        const matchingShops = shops.filter(shop =>
          visibleShopIds.includes(shop.id)
        ).slice(0, 20); // Limit to 20

        console.log("Setting visible shops from markers:", matchingShops.length);

        // Important: Create a new array to ensure React detects the change
        setVisibleShops([...matchingShops]);
        return;
      }

      // If we have clusters but no individual markers, we need to get shops from the clusters
      if (visibleClusters.length > 0 && visibleMarkers.length === 0) {
        // We'll use the bounds approach since we can't directly access cluster contents
        // This is a fallback when we only have clusters visible
        console.log("Only clusters visible, using bounds approach");
      }

      // Fallback: Manually check which shops are within the current bounds
      const visibleShopsInBounds = shops.filter(shop => {
        if (!shop.lat || !shop.lng) return false;

        const lat = parseFloat(shop.lat);
        const lng = parseFloat(shop.lng);

        // Check if the shop coordinates are within the current map bounds
        return lat >= bounds.getSouth() &&
          lat <= bounds.getNorth() &&
          lng >= bounds.getWest() &&
          lng <= bounds.getEast();
      });

      console.log("Shops in bounds (fallback):", visibleShopsInBounds.length);

      if (visibleShopsInBounds.length === 0) {
        console.log("No shops in bounds, clearing visible shops");
        setVisibleShops([]);
        return;
      }

      // Sort shops by distance from center if we have user location
      let sortedShops = [...visibleShopsInBounds];
      const mapCenter = map.getCenter();
      sortedShops.sort((a, b) => {
        // Calculate distance from map center
        const distA = Math.sqrt(
          Math.pow(parseFloat(a.lat) - mapCenter.lat, 2) +
          Math.pow(parseFloat(a.lng) - mapCenter.lng, 2)
        );
        const distB = Math.sqrt(
          Math.pow(parseFloat(b.lat) - mapCenter.lat, 2) +
          Math.pow(parseFloat(b.lng) - mapCenter.lng, 2)
        );
        return distA - distB;
      });

      // Limit to 20 shops
      const limitedShops = sortedShops.slice(0, 20);

      console.log("Setting visible shops (fallback):", limitedShops.length);

      // Important: Create a new array to ensure React detects the change
      setVisibleShops([...limitedShops]);
    } catch (error) {
      console.error("Error detecting visible shops:", error);
    }
  };

  // Setup event listeners for map movement and zoom
  map.on('moveend', updateVisibleShops);
  map.on('zoomend', updateVisibleShops);

  // Add listener for source data loading - this is when we'll first show the cards
  map.on('sourcedata', (e) => {
    if (e.sourceId === 'coffee-shops' && map.isSourceLoaded('coffee-shops')) {
      console.log("Source data loaded, updating visible shops");

      // Only update if we don't already have visible shops
      const currentVisibleShops = setVisibleShops.__currentValue || [];
      if (currentVisibleShops.length === 0) {
        console.log("First time source data loaded, setting initial visible shops");
        updateVisibleShops();
      } else {
        console.log("Source data loaded but we already have visible shops");
      }
    }
  });

  // Setup force update handler
  const setupForceUpdateHandler = () => {
    // Debounce function to prevent too many updates
    let updateTimeout = null;

    // Add a handler to force update visible shops
    const forceUpdateHandler = () => {
      // Clear any existing timeout
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }

      // Set a new timeout to update after a delay
      updateTimeout = setTimeout(() => {
        if (map) {
          console.log("=== FORCE UPDATE VISIBLE SHOPS ===");
          // Get unclustered points
          const features = map.queryRenderedFeatures({ layers: ['unclustered-point'] });
          console.log("Force update: unclustered features found:", features.length);

          if (features.length > 0) {
            const updatedVisibleShops = features.map(feature => {
              const props = feature.properties;
              const id = typeof props.id === 'string' ? parseInt(props.id, 10) : props.id;
              return shops.find(shop => shop.id === id);
            })
              .filter(Boolean)
              .slice(0, 20);

            if (updatedVisibleShops.length > 0) {
              console.log("Force updating visible shops:", updatedVisibleShops.length);

              // Compare with current visible shops to avoid unnecessary updates
              const currentVisibleShops = setVisibleShops.__currentValue || [];
              const currentIds = currentVisibleShops.map(shop => shop.id).sort().join(',');
              const newIds = updatedVisibleShops.map(shop => shop.id).sort().join(',');

              if (currentIds !== newIds) {
                setVisibleShops([...updatedVisibleShops]);
              } else {
                console.log("Skipping update - same shops already visible");
              }
            }
          }
        }
      }, 300); // Longer delay to prevent rapid updates
    };

    // Add event listeners for map interaction
    map.on('dragend', forceUpdateHandler);
    map.on('zoomend', forceUpdateHandler);
    map.on('click', forceUpdateHandler);

    // Return cleanup function
    return () => {
      if (map) {
        map.off('dragend', forceUpdateHandler);
        map.off('zoomend', forceUpdateHandler);
        map.off('click', forceUpdateHandler);
      }
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
    };
  };

  // Setup cluster check
  const setupClusterCheck = () => {
    const checkForClusters = () => {
      if (map) {
        const clusters = map.queryRenderedFeatures({ layers: ['clusters'] });
        console.log("Checking for clusters:", clusters.length);
        setHasClusters(clusters.length > 0);
      }
    };

    map.on('idle', checkForClusters);

    // Initial check
    checkForClusters();

    // Return cleanup function
    return () => {
      if (map) {
        map.off('idle', checkForClusters);
      }
    };
  };

  return {
    updateVisibleShops,
    setupForceUpdateHandler,
    setupClusterCheck
  };
};

// Helper function to create GeoJSON features from shops
export const createGeoJSONFeatures = (shops) => {
  return shops.map(shop => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [shop.lng, shop.lat]
    },
    properties: {
      id: shop.id,
      name: shop.name,
      slug: shop.slug,
      address: shop.address || '',
      logo: shop.logo_url,
      cover_photo: shop.cover_photo_url
    }
  }));
};
