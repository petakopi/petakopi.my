import { Controller } from "@hotwired/stimulus"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css";

export default class extends Controller {
  static values = {
    apiKey: String,
  }

  static targets = [
    "filterFormModal",
  ]

  connect() {
    this.map = null
    this.initMapbox()
  }

  initMapbox() {
    const mapElement = document.getElementById("map")

    if (mapElement) {
      mapboxgl.accessToken = this.apiKeyValue
      this.map = new mapboxgl.Map({
        container: "map", // Use the container ID
        style: "mapbox://styles/mapbox/streets-v12",
        zoom: 10,
        center: [101.7121498580279, 3.1578064758309883],
      })
    }

    var geolocate =
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        // When active the map will receive updates to the device's location as it changes.
        trackUserLocation: true,
        // Draw an arrow next to the location dot to indicate which direction the device is heading.
        showUserHeading: true,
      })

    this.map.addControl(new mapboxgl.NavigationControl())
    this.map.addControl(geolocate)
  }

  toggleFilterFormModal() {
    if (this.filterFormModalTarget.style.display === "block") {
      this.filterFormModalTarget.style.display = "none"
    } else {
      this.filterFormModalTarget.style.display = "block"
    }
  }
}
