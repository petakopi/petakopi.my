import React from "react"

const SelectFilterOption = ({
  id,
  name,
  value,
  onChange,
  options,
  label,
  disabled = false
}) => {
  return (
    <div className="mb-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-xs border-gray-300 focus:outline-none focus:ring-brown-500 focus:border-brown-500 rounded-md"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default SelectFilterOption
