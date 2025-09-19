// Handles map events and shop visibility logic
export const setupMapEventHandlers = (
  map,
  shops,
  setHasClusters,
  mapLoaded
) => {
  if (!map) return

  // Setup cluster check
  const setupClusterCheck = () => {
    const checkForClusters = () => {
      if (map) {
        const clusters = map.queryRenderedFeatures({ layers: ["clusters"] })
        setHasClusters(clusters.length > 0)
      }
    }

    map.on("idle", checkForClusters)
    checkForClusters()

    return () => {
      if (map) {
        map.off("idle", checkForClusters)
      }
    }
  }

  return {
    setupClusterCheck,
  }
}

// Helper function to create GeoJSON features from shops
export const createGeoJSONFeatures = (shops) => {
  return shops.map((shop) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [parseFloat(shop.lng), parseFloat(shop.lat)],
    },
    properties: {
      uuid: shop.uuid,
      name: shop.name,
      address: shop.address || "",
      logo: shop.logo_url,
      cover_photo: shop.cover_photo_url,
    },
  }))
}
