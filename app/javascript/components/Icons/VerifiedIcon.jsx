import React from "react"

const VerifiedIcon = ({ className = "w-4", isPremium = false }) => {
  if (isPremium) {
    return (
      <svg
        className={className}
        viewBox="0 0 22 22"
        aria-hidden="true"
      >
        <g>
          <linearGradient gradientUnits="userSpaceOnUse" id="19-a" x1="4.411" x2="18.083" y1="2.495" y2="21.508">
            <stop offset="0" stopColor="#f4e72a" />
            <stop offset=".539" stopColor="#cd8105" />
            <stop offset=".68" stopColor="#cb7b00" />
            <stop offset="1" stopColor="#f4ec26" />
            <stop offset="1" stopColor="#f4e72a" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="19-b" x1="5.355" x2="16.361" y1="3.395" y2="19.133">
            <stop offset="0" stopColor="#f9e87f" />
            <stop offset=".406" stopColor="#e2b719" />
            <stop offset=".989" stopColor="#e2b719" />
          </linearGradient>
          <g clipRule="evenodd" fillRule="evenodd">
            <path d="M13.324 3.848L11 1.6 8.676 3.848l-3.201-.453-.559 3.184L2.06 8.095 3.48 11l-1.42 2.904 2.856 1.516.559 3.184 3.201-.452L11 20.4l2.324-2.248 3.201.452.559-3.184 2.856-1.516L18.52 11l1.42-2.905-2.856-1.516-.559-3.184z" fill="url(#19-a)" />
            <path d="M13.101 4.533L11 2.5 8.899 4.533l-2.895-.41-.505 2.88-2.583 1.37L4.2 11l-1.284 2.627 2.583 1.37.505 2.88 2.895-.41L11 19.5l2.101-2.033 2.895.41.505-2.88 2.583-1.37L17.8 11l1.284-2.627-2.583-1.37-.505-2.88z" fill="url(#19-b)" />
            <path d="m6.233 11.423 3.429 3.428 5.683-6.206-1.347-1.247-4.4 4.795-2.072-2.072z" fill="black" />
            <path d="M6.233 11.423l3.429 3.428 5.65-6.17.038-.033-.005 1.398-5.683 6.206-3.429-3.429-.003-1.405.005.003z" fill="#d18800" />
          </g>
        </g>
      </svg>
    )
  }
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="green"
    >
      <path d="M256 0C292.8 0 324.8 20.7 340.9 51.1C373.8 40.1 410.1 48.96 437 74.98C463 101 470.1 138.2 460.9 171.1C491.3 187.2 512 219.2 512 256C512 292.8 491.3 324.8 460.9 340.9C471 373.8 463 410.1 437 437C410.1 463 373.8 470.1 340.9 460.9C324.8 491.3 292.8 512 256 512C219.2 512 187.2 491.3 171.1 460.9C138.2 471 101 463 74.98 437C48.96 410.1 41 373.8 51.1 340.9C20.7 324.8 0 292.8 0 256C0 219.2 20.7 187.2 51.1 171.1C40.1 138.2 48.96 101 74.98 74.98C101 48.96 138.2 41 171.1 51.1C187.2 20.7 219.2 0 256 0V0zM352.1 224.1C362.3 215.6 362.3 200.4 352.1 191C343.6 181.7 328.4 181.7 319 191L224 286.1L184.1 247C175.6 237.7 160.4 237.7 151 247C141.7 256.4 141.7 271.6 151 280.1L207 336.1C216.4 346.3 231.6 346.3 240.1 336.1L352.1 224.1z" />
    </svg>
  )
}

export default VerifiedIcon
