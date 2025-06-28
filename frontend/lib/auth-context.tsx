"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { jwtDecode } from "jwt-decode"
import { useToast } from "@/components/ui/use-toast"

type UserRole = "citizen" | "manager" | "admin" | "grantee"

interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

interface AuthContextType {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  login: (
    email: string,
    password: string,
    role: UserRole,
    roleUsername?: string,
    rolePassword?: string,
  ) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  refreshAccessToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  // Use a ref to track the refresh interval
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  // Use a ref to track the last refresh time
  const lastRefreshTimeRef = useRef<number>(0)

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedAccessToken = localStorage.getItem("accessToken")
    const storedRefreshToken = localStorage.getItem("refreshToken")

    if (storedAccessToken) {
      try {
        const decodedToken: any = jwtDecode(storedAccessToken)
        const currentTime = Date.now() / 1000

        if (decodedToken.exp > currentTime) {
          setAccessToken(storedAccessToken)
          setRefreshToken(storedRefreshToken)
          setUser({
            id: decodedToken.user_id,
            name: decodedToken.name || "User",
            email: decodedToken.email,
            role: decodedToken.role,
          })
        } else {
          // Token expired, try to refresh
          refreshAccessTokenInternal(storedRefreshToken)
        }
      } catch (error) {
        console.error("Failed to decode token:", error)
        clearAuthState()
      }
    }

    setIsLoading(false)
  }, [])

  // Redirect based on auth state and current path
  useEffect(() => {
    if (!isLoading) {
      const isAuthPage = pathname?.includes("/auth/")

      if (!user && !isAuthPage && pathname !== "/") {
        router.push("/")
      } else if (user && isAuthPage) {
        redirectToDashboard(user.role)
      }
    }
  }, [user, isLoading, pathname, router])

  // Set up automatic token refresh every 4 minutes
  useEffect(() => {
    // Clear any existing interval when this effect runs
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
      refreshIntervalRef.current = null
    }

    // Only set up the timer if the user is logged in
    if (refreshToken) {
      console.log("Setting up automatic token refresh timer (every 4 minutes)")

      // Check if token is close to expiration
      if (accessToken) {
        try {
          const decodedToken: any = jwtDecode(accessToken)
          const currentTime = Date.now() / 1000
          const timeUntilExpiry = decodedToken.exp - currentTime

          // If token expires in less than 5 minutes, refresh it now
          // But only if we haven't refreshed in the last 3 minutes
          const timeSinceLastRefresh = (Date.now() - lastRefreshTimeRef.current) / 1000
          if (timeUntilExpiry < 300 && timeSinceLastRefresh > 180) {
            console.log("Token expiring soon, refreshing now")
            refreshAccessToken().then((success) => {
              if (success) {
                lastRefreshTimeRef.current = Date.now()
                console.log("Token refreshed successfully")
              }
            })
          }
        } catch (error) {
          console.error("Error checking token expiration:", error)
        }
      }

      // Set up interval for regular refresh (every 4 minutes = 240000 ms)
      refreshIntervalRef.current = setInterval(() => {
        // Check if enough time has passed since last refresh (at least 3.5 minutes)
        const timeSinceLastRefresh = (Date.now() - lastRefreshTimeRef.current) / 1000
        if (timeSinceLastRefresh < 210) {
          console.log(`Skipping refresh, last refresh was ${Math.round(timeSinceLastRefresh)} seconds ago`)
          return
        }

        console.log("Automatic token refresh triggered")
        refreshAccessToken()
          .then((success) => {
            if (success) {
              lastRefreshTimeRef.current = Date.now()
              console.log("Token refreshed successfully at", new Date().toISOString())
            } else {
              console.warn("Token refresh failed")
            }
          })
          .catch((error) => {
            console.error("Error during automatic token refresh:", error)
          })
      }, 240000) // 4 minutes

      // Clean up interval on unmount
      return () => {
        if (refreshIntervalRef.current) {
          console.log("Clearing token refresh timer")
          clearInterval(refreshIntervalRef.current)
          refreshIntervalRef.current = null
        }
      }
    }
  }, [refreshToken]) // Only re-run if refreshToken changes

  const redirectToDashboard = (role: UserRole) => {
    switch (role) {
      case "citizen":
        router.push("/citizen/dashboard")
        break
      case "manager":
        router.push("/manager/dashboard")
        break
      case "admin":
        router.push("/admin/dashboard")
        break
      case "grantee":
        router.push("/grantee/dashboard")
        break
    }
  }

  const clearAuthState = () => {
    setUser(null)
    setAccessToken(null)
    setRefreshToken(null)
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
  }

  // Helper function to check if response is HTML
  const isHtmlResponse = (text: string) => {
    return text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")
  }

  // Helper function to retry a fetch operation
  const retryFetch = async (url: string, options: RequestInit, maxRetries = 3, delay = 1000) => {
    let lastError

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`Fetch attempt ${attempt + 1} to ${url}`)
        return await fetch(url, options)
      } catch (error) {
        console.error(`Fetch attempt ${attempt + 1} failed:`, error)
        lastError = error

        // Wait before retrying
        if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay))
          // Increase delay for next retry (exponential backoff)
          delay *= 2
        }
      }
    }

    // If we get here, all retries failed
    throw lastError
  }

  // Update the login function to handle both citizen and role-specific credentials
  const login = async (
    email: string,
    password: string,
    role: UserRole,
    roleUsername?: string,
    rolePassword?: string,
  ) => {
    setIsLoading(true)

    try {
      let endpoint
      let payload: any = { Email: email, password }

      switch (role) {
        case "citizen":
          endpoint = "/api/auth/login/"
          break
        case "manager":
          endpoint = "/api/manager/login/"
          // Add SiteManager specific fields
          payload = {
            ...payload,
            ManagerUserName: roleUsername || email.split("@")[0],
            ManagerPassword: rolePassword || password,
          }
          break
        case "admin":
          endpoint = "/api/admin/login/"
          // Add Administrator specific fields
          payload = {
            ...payload,
            AdministratorUserName: roleUsername || email.split("@")[0],
            AdministratorPassword: rolePassword || password,
          }
          break
        case "grantee":
          endpoint = "/api/grantee/login/"
          // Add Grantee specific fields
          payload = {
            ...payload,
            GranteeUserName: roleUsername || email.split("@")[0],
            GranteePassword: rolePassword || password,
          }
          break
        default:
          throw new Error("Invalid role")
      }

      // Log the API URL for debugging
      // Fix: Use the base URL without duplicating /api
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`
      console.log("Attempting login to:", apiUrl)
      console.log("With payload:", JSON.stringify(payload))

      // Use retry fetch for better reliability
      const response = await retryFetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      // Get the response text first to check if it's HTML
      const responseText = await response.text()

      // Check if the response is HTML
      if (isHtmlResponse(responseText)) {
        console.error("Received HTML response instead of JSON:", responseText.substring(0, 200))
        throw new Error("Server returned HTML instead of JSON. Please check the API URL.")
      }

      // Parse the response as JSON if it's not HTML
      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("Failed to parse response as JSON:", responseText.substring(0, 200))
        throw new Error("Invalid JSON response from server")
      }

      if (!response.ok) {
        throw new Error(data.detail || "Login failed")
      }

      // Store tokens
      localStorage.setItem("accessToken", data.access)
      localStorage.setItem("refreshToken", data.refresh)

      // Decode token to get user info
      const decodedToken: any = jwtDecode(data.access)

      setAccessToken(data.access)
      setRefreshToken(data.refresh)
      setUser({
        id: decodedToken.user_id,
        name: decodedToken.name || decodedToken.user_name || "User",
        email: decodedToken.email,
        role: role,
      })

      // Set the last refresh time to now
      lastRefreshTimeRef.current = Date.now()

      toast({
        title: "Login successful",
        description: "You have been logged in successfully.",
        variant: "default",
      })

      redirectToDashboard(role)
    } catch (error: any) {
      let errorMessage = "An error occurred during login"

      if (error.name === "TypeError" && error.message === "Failed to fetch") {
        errorMessage = "Network error. Please check your internet connection and try again."
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      })
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: any) => {
    setIsLoading(true)

    try {
      // Fix: Use the correct URL format
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register/`
      console.log("Attempting registration to:", apiUrl)

      // Use retry fetch for better reliability
      const response = await retryFetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      // Get the response text first to check if it's HTML
      const responseText = await response.text()

      // Check if the response is HTML
      if (isHtmlResponse(responseText)) {
        console.error("Received HTML response instead of JSON:", responseText.substring(0, 200))
        throw new Error("Server returned HTML instead of JSON. Please check the API URL.")
      }

      // Parse the response as JSON if it's not HTML
      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("Failed to parse response as JSON:", responseText.substring(0, 200))
        throw new Error("Invalid JSON response from server")
      }

      if (!response.ok) {
        throw new Error(data.detail || "Registration failed")
      }

      toast({
        title: "Registration successful",
        description: "Your account has been created. You can now log in.",
        variant: "default",
      })

      router.push("/auth/login?role=citizen")
    } catch (error: any) {
      let errorMessage = "An error occurred during registration"

      if (error.name === "TypeError" && error.message === "Failed to fetch") {
        errorMessage = "Network error. Please check your internet connection and try again."
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      })
      console.error("Registration error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Clear the refresh interval when logging out
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
      refreshIntervalRef.current = null
    }

    clearAuthState()
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
      variant: "default",
    })
    router.push("/")
  }

  const refreshAccessTokenInternal = async (token: string | null) => {
    if (!token) {
      clearAuthState()
      return false
    }

    try {
      // Fix: Use the correct URL format
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh/`
      console.log("Attempting token refresh at:", apiUrl)

      // Use retry fetch for better reliability
      const response = await retryFetch(
        apiUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh: token }),
        },
        3,
        1000,
      )

      // Get the response text first to check if it's HTML
      const responseText = await response.text()

      // Check if the response is HTML
      if (isHtmlResponse(responseText)) {
        console.error("Received HTML response instead of JSON:", responseText.substring(0, 200))
        throw new Error("Server returned HTML instead of JSON. Please check the API URL.")
      }

      // Parse the response as JSON if it's not HTML
      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("Failed to parse response as JSON:", responseText.substring(0, 200))
        throw new Error("Invalid JSON response from server")
      }

      if (!response.ok) {
        throw new Error("Failed to refresh token")
      }

      localStorage.setItem("accessToken", data.access)
      setAccessToken(data.access)

      // Update user from new token
      const decodedToken: any = jwtDecode(data.access)
      setUser({
        id: decodedToken.user_id,
        name: decodedToken.name || "User",
        email: decodedToken.email,
        role: decodedToken.role,
      })

      // Update the last refresh time
      lastRefreshTimeRef.current = Date.now()

      return true
    } catch (error) {
      // Handle network errors specifically
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        console.error("Network error during token refresh:", error)
        // Don't clear auth state for network errors, as they might be temporary
        // Instead, return false to indicate refresh failed
        return false
      } else {
        console.error("Token refresh error:", error)
        clearAuthState()
        return false
      }
    }
  }

  const refreshAccessToken = () => refreshAccessTokenInternal(refreshToken)

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isLoading,
        login,
        register,
        logout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
