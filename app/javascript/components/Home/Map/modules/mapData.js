import { createGeoJSONFeatures } from "../MapEventHandler"

export const updateMapSource = (map, shops) => {
  if (!map || !map.getSource("coffee-shops") || shops.length === 0) {
    return false
  }

  const features = createGeoJSONFeatures(shops)

  try {
    map.getSource("coffee-shops").setData({
      type: "FeatureCollection",
      features: features,
    })
    return true
  } catch (error) {
    return false
  }
}
