// Token refresh utility

// Function to check if token needs refresh (token is valid for less than 5 minutes)
export const needsRefresh = (): boolean => {
  const token = localStorage.getItem("accessToken")
  if (!token) return true

  try {
    // JWT tokens are in three parts: header.payload.signature
    const payload = token.split(".")[1]
    // Decode the base64 payload
    const decodedPayload = JSON.parse(atob(payload))
    // Check if token expires in less than 5 minutes
    return decodedPayload.exp * 1000 < Date.now() + 5 * 60 * 1000
  } catch (error) {
    console.error("Error parsing token:", error)
    return true
  }
}

// Function to refresh the token
export const refreshToken = async (): Promise<boolean> => {
  try {
    const refreshToken = localStorage.getItem("refreshToken")
    if (!refreshToken) return false

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    })

    if (!response.ok) {
      // If refresh fails, clear tokens and return false
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      return false
    }

    const data = await response.json()
    localStorage.setItem("accessToken", data.access)

    // If a new refresh token is provided, update it
    if (data.refresh) {
      localStorage.setItem("refreshToken", data.refresh)
    }

    return true
  } catch (error) {
    console.error("Error refreshing token:", error)
    return false
  }
}

// Setup automatic token refresh every 4 minutes
export const setupTokenRefresh = (): number => {
  // Check and refresh token immediately if needed
  if (needsRefresh()) {
    refreshToken()
  }

  // Set up interval for token refresh (every 4 minutes)
  return window.setInterval(
    async () => {
      if (needsRefresh()) {
        const success = await refreshToken()
        if (!success) {
          // If refresh fails, redirect to login
          window.location.href = "/auth/login"
        }
      }
    },
    4 * 60 * 1000,
  ) // 4 minutes
}

// Function to clean up the interval
export const cleanupTokenRefresh = (intervalId: number): void => {
  clearInterval(intervalId)
}
