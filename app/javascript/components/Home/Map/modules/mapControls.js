import mapboxgl from "mapbox-gl"

export const setupMapControls = (map, mapContainer) => {
  map.addControl(new mapboxgl.AttributionControl(), "bottom-left")
  map.addControl(new mapboxgl.NavigationControl(), "top-right")

  map.addControl(
    new mapboxgl.FullscreenControl({
      container: mapContainer.current,
    }),
    "top-right"
  )

  map.addControl(
    new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    }),
    "top-right"
  )
}
