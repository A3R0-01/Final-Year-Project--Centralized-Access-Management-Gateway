"use client"

import { useAuth } from "./auth-context"

// Base API URL - ensure it doesn't end with /api
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

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

// Custom fetch function that handles authentication and token refresh
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const { accessToken, refreshAccessToken, logout } = useAuth()

  // Prepare headers with authentication token if available
  const headers = {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  }

  try {
    // Ensure endpoint has the correct format - make sure we don't duplicate /api
    const apiEndpoint = endpoint.startsWith("/api") ? endpoint : `/api${endpoint}`
    const url = `${API_BASE_URL}${apiEndpoint}`

    console.log(`Making API request to: ${url}`)

    // First attempt with current access token - use retry fetch
    const response = await retryFetch(
      url,
      {
        ...options,
        headers,
      },
      2,
      1000,
    )

    if (options.method === "POST") {
      console.log(`POST Response from ${url}:`, response)

      // Clone the response to log the body without consuming it
      const responseClone = response.clone()
      responseClone
        .text()
        .then((text) => {
          try {
            const data = JSON.parse(text)
            console.log("POST Response body:", data)
          } catch (e) {
            console.log("POST Response text:", text)
          }
        })
        .catch((err) => {
          console.log("Could not parse response:", err)
        })
    }

    // If unauthorized and we have a refresh function, try to refresh the token
    if (response.status === 401 && refreshAccessToken) {
      console.log("Received 401, attempting to refresh token")
      const refreshSuccess = await refreshAccessToken()

      // If refresh successful, retry the request with new token
      if (refreshSuccess) {
        console.log("Token refresh successful, retrying request")
        const newHeaders = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          ...options.headers,
        }

        const response = await retryFetch(
          url,
          {
            ...options,
            headers: newHeaders,
          },
          2,
          1000,
        )

        if (options.method === "POST") {
          console.log(`POST Response after token refresh from ${url}:`, response)

          // Clone the response to log the body without consuming it
          const responseClone = response.clone()
          responseClone
            .text()
            .then((text) => {
              try {
                const data = JSON.parse(text)
                console.log("POST Response body after token refresh:", data)
              } catch (e) {
                console.log("POST Response text after token refresh:", text)
              }
            })
            .catch((err) => {
              console.log("Could not parse response after token refresh:", err)
            })
        }

        return response
      } else {
        // If refresh failed, logout and throw error
        console.log("Token refresh failed, logging out")
        logout()
        throw new Error("Session expired. Please log in again.")
      }
    }

    // Clone the response to use it twice
    const clonedResponse = response.clone()

    // Check if the response is HTML
    let responseText
    try {
      responseText = await clonedResponse.text()
      if (isHtmlResponse(responseText)) {
        console.error("Received HTML response instead of JSON:", responseText.substring(0, 200))
        throw new Error("Server returned HTML instead of JSON. Please check the API URL.")
      }
    } catch (error) {
      console.error("Error reading response:", error)
      // If we can't read the response, return the original response
      return response
    }

    // If we got here, the original response was consumed, so return a new response with the text
    return new Response(responseText, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    })
  } catch (error) {
    // Provide more specific error messages for network errors
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      console.error("Network error during API request:", error)
      throw new Error("Network error. Please check your internet connection and try again.")
    } else {
      console.error("API request failed:", error)
      throw error
    }
  }
}

// Update API client to match backend endpoints
export const apiClient = {
  // Citizen endpoints
  citizen: {
    getDepartments: () => fetchWithAuth("/department/"),
    getAssociations: () => fetchWithAuth("/association/"),
    getServices: () => fetchWithAuth("/service/"),
    getRequests: () => fetchWithAuth("/request/"),
    getRequest: (id: string) => fetchWithAuth(`/request/${id}/`),
    createRequest: (data: any) =>
      fetchWithAuth("/request/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateRequest: (id: string, data: any) =>
      fetchWithAuth(`/request/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    getGrants: () => fetchWithAuth("/grant/"),
    updateProfile: (data: any) =>
      fetchWithAuth("/citizen/", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  },

  // Site Manager endpoints
  manager: {
    getCitizens: () => fetchWithAuth("/manager/citizen/"),
    getAdministrators: () => fetchWithAuth("/manager/administrator/"),
    getGrantees: () => fetchWithAuth("/manager/grantee/"),
    getDepartments: () => fetchWithAuth("/manager/department/"),
    getAssociations: () => fetchWithAuth("/manager/association/"),
    getServices: () => fetchWithAuth("/manager/service/"),
    getRequests: () => fetchWithAuth("/manager/request/"),
    getRequest: (id: string) => fetchWithAuth(`/manager/request/${id}/`),
    approveRequest: (id: string, data: any) =>
      fetchWithAuth(`/manager/request/${id}/approve/`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    rejectRequest: (id: string, data: any) =>
      fetchWithAuth(`/manager/request/${id}/reject/`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getGrants: () => fetchWithAuth("/manager/grant/"),
    getLogs: {
      citizen: () => fetchWithAuth("/manager/log/citizen/"),
      grantee: () => fetchWithAuth("/manager/log/grantee/"),
      administrator: () => fetchWithAuth("/manager/log/administrator/"),
      manager: () => fetchWithAuth("/manager/log/manager/"),
    },
    getPermissions: {
      department: () => fetchWithAuth("/manager/permission/department/"),
      association: () => fetchWithAuth("/manager/permission/association/"),
      service: () => fetchWithAuth("/manager/permission/service/"),
    },
    createAdministrator: (data: any) =>
      fetchWithAuth("/manager/administrator/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    createGrantee: (data: any) =>
      fetchWithAuth("/manager/grantee/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    createDepartment: (data: any) =>
      fetchWithAuth("/manager/department/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    createAssociation: (data: any) =>
      fetchWithAuth("/manager/association/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    createService: (data: any) =>
      fetchWithAuth("/manager/service/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // Administrator endpoints
  admin: {
    getCitizens: () => fetchWithAuth("/admin/citizen/"),
    getAdministrators: () => fetchWithAuth("/admin/admin/"),
    getGrantees: () => fetchWithAuth("/admin/grantee/"),
    getDepartments: () => fetchWithAuth("/admin/department/"),
    getAssociations: () => fetchWithAuth("/admin/association/"),
    getServices: () => fetchWithAuth("/admin/service/"),
    getRequests: () => fetchWithAuth("/admin/request/"),
    getRequest: (id: string) => fetchWithAuth(`/admin/request/${id}/`),
    approveRequest: (id: string, data: any) =>
      fetchWithAuth(`/admin/request/${id}/approve/`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    rejectRequest: (id: string, data: any) =>
      fetchWithAuth(`/admin/request/${id}/reject/`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getGrants: () => fetchWithAuth("/admin/grant/"),
    getLogs: {
      citizen: () => fetchWithAuth("/admin/log/citizen/"),
      grantee: () => fetchWithAuth("/admin/log/grantee/"),
    },
    getPermissions: {
      department: () => fetchWithAuth("/admin/permission/department/"),
      association: () => fetchWithAuth("/admin/permission/association/"),
      service: () => fetchWithAuth("/admin/permission/service/"),
    },
    createGrantee: (data: any) =>
      fetchWithAuth("/admin/grantee/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    createAssociation: (data: any) =>
      fetchWithAuth("/admin/association/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    createService: (data: any) =>
      fetchWithAuth("/admin/service/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateProfile: (data: any) =>
      fetchWithAuth("/admin/admin/", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  },

  // Grantee endpoints
  grantee: {
    getCitizens: () => fetchWithAuth("/grantee/citizen/"),
    getDepartments: () => fetchWithAuth("/grantee/department/"),
    getAssociations: () => fetchWithAuth("/grantee/association/"),
    getServices: () => fetchWithAuth("/grantee/service/"),
    getRequests: () => fetchWithAuth("/grantee/request/"),
    getRequest: (id: string) => fetchWithAuth(`/grantee/request/${id}/`),
    approveRequest: (id: string, data: any) =>
      fetchWithAuth(`/grantee/request/${id}/approve/`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    rejectRequest: (id: string, data: any) =>
      fetchWithAuth(`/grantee/request/${id}/reject/`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getGrants: () => fetchWithAuth("/grantee/grant/"),
    createGrant: (data: any) =>
      fetchWithAuth("/grantee/grant/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateGrant: (id: string, data: any) =>
      fetchWithAuth(`/grantee/grant/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    updateProfile: (data: any) =>
      fetchWithAuth("/grantee/grantee/", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  },
}
