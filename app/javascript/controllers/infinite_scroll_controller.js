import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["loader"]

  connect() {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 1.0,
    }

    this.observer = new IntersectionObserver(this.loadMore.bind(this), options)
    this.observer.observe(this.loaderTarget)
  }

  loadMore(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const nextPage = document.getElementById("load-more-link")

        if (nextPage) {
          nextPage.classList.remove("hidden")
          nextPage.click()
        }
      }
    })
  }

  disconnect() {
    this.observer.disconnect()
  }
}
