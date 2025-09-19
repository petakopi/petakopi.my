import React from "react"

const RadioFilterOption = ({
  id,
  name,
  value,
  checked,
  onChange,
  label,
  disabled = false,
}) => {
  return (
    <div className="flex items-center">
      <div className="flex items-center h-5">
        <input
          id={id}
          name={name}
          type="radio"
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`focus:ring-2 focus:ring-brown-500 h-4 w-4 text-brown-600 border-gray-300 rounded-full ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        />
      </div>
      <div className="ml-2">
        <label
          htmlFor={id}
          className={`text-xs text-gray-700 ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          {label}
        </label>
      </div>
    </div>
  )
}

export default RadioFilterOption
