import { Controller } from "@hotwired/stimulus"
import { get } from "@rails/request.js"

export default class extends Controller {
  static targets = [
    "container",
    "loader",
    "loadingContainer",
    "tabs",
  ]

  static classes = {
    active: ["border-brown-500", "text-brown-600"],
    inactive: ["border-transparent", "text-gray-500", "hover:border-gray-300", "hover:text-gray-700"]
  }

  connect() {
    this.activateTab(this.tabsTargets[0])
  }

  changeTab(event) {
    event.preventDefault()
    this.activateTab(event.currentTarget)
  }

  activateTab(selectedTab) {
    this.updateTabStates(selectedTab)
    this.showLoadingState()
    this.fetchContent(selectedTab.dataset.url)
  }

  updateTabStates(selectedTab) {
    this.tabsTargets.forEach(tab => {
      tab.classList.remove(...this.constructor.classes.active)
      tab.classList.add(...this.constructor.classes.inactive)
    })

    selectedTab.classList.remove(...this.constructor.classes.inactive)
    selectedTab.classList.add(...this.constructor.classes.active)
  }

  showLoadingState() {
    const loadingContent = this.loadingContainerTarget.cloneNode(true)
    this.containerTarget.innerHTML = loadingContent.innerHTML
  }

  async fetchContent(url) {
    try {
      // Prevent next page loaded when switching tabs
      document.getElementById("hws-pager").innerHTML = ""

      const response = await get(url, {
        responseKind: "turbo-stream"
      })

      if (response.ok) {
        this.loaderTargets.forEach(loader => loader.remove())
      }
    } catch (error) {
      console.error("Error fetching content:", error)
    }
  }
}
