import React from "react"

const FilterSearch = ({ value, onChange, placeholder }) => {
  return (
    <div>
      <input
        type="text"
        id="keyword"
        name="keyword"
        value={value}
        onChange={onChange}
        placeholder={placeholder || "Search by name..."}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 text-sm"
      />
    </div>
  )
}

export default FilterSearch
