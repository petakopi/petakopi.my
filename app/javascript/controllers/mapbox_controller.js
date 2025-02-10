import { Controller } from "@hotwired/stimulus"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css";

export default class extends Controller {
  static values = {
    apiKey: String,
  }

  static targets = [
    "askPermissionModal",
    "filterFormModal",
    "locationButton",
    "locationButtonText",
    "locationSpinner",
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

    this.geolocateControl =
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
    this.map.addControl(this.geolocateControl)
  }

  setCurrentLocation() {
    // Disable button and show loading state
    this.locationButtonTarget.disabled = true;
    this.locationButtonTextTarget.textContent = "Getting location...";
    this.locationSpinnerTarget.classList.remove("hidden");

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.latValue = lat;
          this.lngValue = lng;

          // Close modal first
          this.toggleAskPermissionModal();

          // Short delay to allow modal to close and map to be visible
          setTimeout(() => {
            this.map.setCenter([lng, lat]);
            this.map.setZoom(14);
            this.geolocateControl.trigger();
            this.resetLocationButton();
          }, 300); // Adjust timing as needed
        },
        () => {
          alert("Unable to get your location. Please make sure you've granted location permissions.");

          this.toggleAskPermissionModal();
          this.resetLocationButton();
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");

      this.toggleAskPermissionModal();
      this.resetLocationButton();
    }
  }

  resetLocationButton() {
    this.locationButtonTarget.disabled = false;
    this.locationButtonTextTarget.textContent = "Yes";
    this.locationSpinnerTarget.classList.add("hidden");
  }

  toggleAskPermissionModal() {
    if (this.askPermissionModalTarget.style.display === "block") {
      this.askPermissionModalTarget.style.display = "none"
    } else {
      this.askPermissionModalTarget.style.display = "block"
    }
  }

  toggleFilterFormModal() {
    if (this.filterFormModalTarget.style.display === "block") {
      this.filterFormModalTarget.style.display = "none"
    } else {
      this.filterFormModalTarget.style.display = "block"
    }
  }
}
