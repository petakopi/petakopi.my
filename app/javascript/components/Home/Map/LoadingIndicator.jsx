import React from "react"

const LoadingIndicator = () => {
  const styles = {
    container: {
      position: "absolute",
      inset: 0,
      backgroundColor: "rgba(255, 255, 255, 0.7)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "0.5rem",
      zIndex: 10,
    },
    dotsContainer: {
      display: "flex",
      gap: "0.5rem",
      marginBottom: "1rem",
    },
    dot: {
      width: "0.5rem",
      height: "0.5rem",
      backgroundColor: "#6B4F4F",
      borderRadius: "9999px",
      animation: "jump 1s infinite",
    },
    text: {
      color: "#6B4F4F",
      fontWeight: 500,
    },
    "@keyframes jump": {
      "0%, 100%": {
        transform: "translateY(0)",
      },
      "50%": {
        transform: "translateY(-10px)",
      },
    },
  }

  // Add the keyframes to the document
  React.useEffect(() => {
    const styleSheet = document.createElement("style")
    styleSheet.textContent = `
      @keyframes jump {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-10px);
        }
      }
    `
    document.head.appendChild(styleSheet)

    return () => {
      document.head.removeChild(styleSheet)
    }
  }, [])

  return (
    <div style={styles.container}>
      <div style={styles.dotsContainer}>
        <div style={{ ...styles.dot, animationDelay: "0ms" }} />
        <div style={{ ...styles.dot, animationDelay: "150ms" }} />
        <div style={{ ...styles.dot, animationDelay: "300ms" }} />
      </div>
      <p style={styles.text}>Loading map...</p>
    </div>
  )
}

export default LoadingIndicator
