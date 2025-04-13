import React from "react"

const RadioFilterOption = ({ id, name, value, checked, onChange, label }) => {
  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          id={id}
          name={name}
          type="radio"
          value={value}
          checked={checked}
          onChange={onChange}
          className="focus:ring-brown-500 h-4 w-4 text-brown-600 border-gray-300"
        />
      </div>
      <div className="ml-2 text-sm">
        <label htmlFor={id} className="text-xs text-gray-700 cursor-pointer">
          {label}
        </label>
      </div>
    </div>
  )
}

export default RadioFilterOption
