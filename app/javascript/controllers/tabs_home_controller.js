import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["container", "loading", "tabs"]

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
    this.loadNewContent(selectedTab)
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
    const loadingContent = this.loadingTarget.cloneNode(true)
    this.containerTarget.innerHTML = loadingContent.innerHTML
  }

  loadNewContent(tab) {
    this.containerTarget.src = tab.dataset.url
    this.containerTarget.reload()
  }
}
