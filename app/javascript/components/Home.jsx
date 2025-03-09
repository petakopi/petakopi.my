import React, { useState } from "react"

const initialTabs = [
  { name: "Everywhere", href: "#", content: "This is the everywhere content." },
  { name: "Nearby", href: "#", content: "This is the nearby content." },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

export default function Home() {
  const [tabs, setTabs] = useState(initialTabs.map((tab, index) => ({
    ...tab,
    current: index === 0
  })))

  const [activeTab, setActiveTab] = useState(0)

  const handleTabChange = (index) => {
    setActiveTab(index)
    setTabs(
      tabs.map((tab, i) => ({
        ...tab,
        current: i === index
      }))
    )
  }
  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab, index) => (
            <button
              key={tab.name}
              onClick={() => handleTabChange(index)}
              className={classNames(
                tab.current
                  ? "border-brown-500 text-brown-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                "whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium",
              )}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Tab Content</h2>
        <div className="prose">
          {tabs[activeTab].content}
        </div>
      </div>
    </div>
  )
}
