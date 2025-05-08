import React from "react"

const FilterSearch = ({ value, onChange, placeholder }) => {
  return (
    <div className="p-4 border-b border-gray-200">
      <label htmlFor="keyword" className="block text-xs font-medium text-gray-700 mb-1">
        Name Search
      </label>
      <input
        type="text"
        id="keyword"
        name="keyword"
        value={value}
        onChange={onChange}
        placeholder={placeholder || "Search coffee shops..."}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 text-sm text-base"
        style={{ fontSize: '16px' }}
      />
    </div>
  )
}

export default FilterSearch
