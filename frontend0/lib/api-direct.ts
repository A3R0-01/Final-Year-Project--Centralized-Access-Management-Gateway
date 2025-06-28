// Direct API client that doesn't use hooks
// This can be safely used in any context, including nested functions

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Helper function to check if response is HTML
const isHtmlResponse = (text: string) => {
  return text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")
}

// Helper function to get token from localStorage
const getToken = () => {
  return localStorage.getItem("accessToken") || ""
}

// Helper function to make authenticated fetch requests
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const accessToken = localStorage.getItem("accessToken")

  const headers = {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  }

  // IMPORTANT: Check if the endpoint contains "/new" and handle it specially
  // We should never make API requests to endpoints with "/new" in them
  if (endpoint.includes("/new")) {
    console.warn(`Prevented API request to invalid endpoint with '/new': ${endpoint}`)

    // For POST requests to create new items, remove the "/new" part
    if (options.method === "POST") {
      endpoint = endpoint.replace(/\/new\/?$/, "")
    } else {
      // For GET requests, we should never be fetching from a "/new" endpoint
      // Return a mock empty response to prevent errors
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: new Headers({ "Content-Type": "application/json" }),
      })
    }
  }

  // Ensure endpoint has the correct format
  const apiEndpoint = endpoint.startsWith("/api") ? endpoint : `/api${endpoint}`
  const url = `${API_BASE_URL}${apiEndpoint}`

  try {
    console.log(`Making API request to: ${url}`)

    const response = await fetch(url, {
      ...options,
      headers,
    })

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

    // Clone the response to use it twice
    const clonedResponse = response.clone()

    // Check if the response is HTML or empty
    let responseText
    try {
      responseText = await clonedResponse.text()

      // If the response is empty (common for DELETE requests)
      if (!responseText) {
        return new Response(null, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        })
      }

      // Check if it's HTML
      if (isHtmlResponse(responseText)) {
        console.error("Received HTML response instead of JSON:", responseText.substring(0, 200))
        throw new Error(`API error: ${response.status} ${response.statusText}`)
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

const getAuthHeaders = () => {
  const accessToken = localStorage.getItem("accessToken")
  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  }
}

// Rest of the file remains the same...
export const directApi = {
  // Citizen endpoints
  citizen: {
    getProfile: async () => {
      try {
        // For getting the profile, we use the special profile endpoint
        const response = await fetch(`${API_BASE_URL}/api/citizen/profile/`, {
          headers: getAuthHeaders(),
        })
        return response
      } catch (error) {
        console.error("Error fetching citizen profile:", error)
        throw error
      }
    },
    updateProfile: async (data: any) => {
      try {
        // Use the correct endpoint for updating profile
        const response = await fetch(`${API_BASE_URL}/api/citizen/profile/`, {
          method: "PATCH",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
        return response
      } catch (error) {
        console.error("Error updating citizen profile:", error)
        throw error
      }
    },
    getDepartments: () => fetchWithAuth("/department/"),
    getAssociations: () => fetchWithAuth("/association/"),
    getServices: () => fetchWithAuth("/service/"),
    getService: (id: string) => fetchWithAuth(`/service/${id}/`),
    getGrants: () => fetchWithAuth("/grant/"),
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
    getGrants: () => fetchWithAuth("/manager/grant/"),
    getProfile: async () => {
      try {
        // The manager endpoint returns an array, so we get the first (and should be only) manager
        const response = await fetch(`${API_BASE_URL}/api/manager/manager/`, {
          headers: getAuthHeaders(),
        })

        if (response.ok) {
          const data = await response.json()
          // Since it returns an array, get the first manager
          if (Array.isArray(data) && data.length > 0) {
            return new Response(JSON.stringify(data[0]), {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
            })
          }
        }
        return response
      } catch (error) {
        console.error("Error fetching manager profile:", error)
        throw error
      }
    },
    updateProfile: async (data: any) => {
      try {
        // For updating, we need to get the manager ID first, then update that specific manager
        const getResponse = await fetch(`${API_BASE_URL}/api/manager/manager/`, {
          headers: getAuthHeaders(),
        })

        if (getResponse.ok) {
          const managers = await getResponse.json()
          if (Array.isArray(managers) && managers.length > 0) {
            const managerId = managers[0].id
            // Update the specific manager
            const response = await fetch(`${API_BASE_URL}/api/manager/manager/${managerId}/`, {
              method: "PATCH",
              headers: {
                ...getAuthHeaders(),
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            })
            return response
          }
        }
        throw new Error("Manager not found")
      } catch (error) {
        console.error("Error updating manager profile:", error)
        throw error
      }
    },
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
    createDepartmentPermission: (data: any) =>
      fetchWithAuth("/manager/permission/department/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    createAssociationPermission: (data: any) =>
      fetchWithAuth("/manager/permission/association/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    createServicePermission: (data: any) =>
      fetchWithAuth("/manager/permission/service/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getAssociation: (id: string) => fetchWithAuth(`/manager/association/${id}/`),
    getRequest: (id: string) => fetchWithAuth(`/manager/request/${id}/`),
    getService: (id: string) => fetchWithAuth(`/manager/service/${id}/`),
    getDepartment: (id: string) => fetchWithAuth(`/manager/department/${id}/`),
    getCitizen: (id: string) => fetchWithAuth(`/manager/citizen/${id}/`),
    getGrantee: (id: string) => fetchWithAuth(`/manager/grantee/${id}/`),
    getAdministrator: (id: string) => fetchWithAuth(`/manager/administrator/${id}/`),
    updateService: (id: string, data: any) =>
      fetchWithAuth(`/manager/service/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    deleteService: (id: string) =>
      fetchWithAuth(`/manager/service/${id}/`, {
        method: "DELETE",
      }),
    updateAssociation: (id: string, data: any) =>
      fetchWithAuth(`/manager/association/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    deleteAssociation: (id: string) =>
      fetchWithAuth(`/manager/association/${id}/`, {
        method: "DELETE",
      }),
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
    getAssociationServices: (id: string) => fetchWithAuth(`/manager/association/${id}/services/`),
    getAssociationGrantees: (id: string) => fetchWithAuth(`/manager/association/${id}/grantees/`),
    updateGrantee: (id: string, data: any) =>
      fetchWithAuth(`/manager/grantee/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    deleteGrantee: (id: string) =>
      fetchWithAuth(`/manager/grantee/${id}/`, {
        method: "DELETE",
      }),
    deleteAdministrator: (id: string) =>
      fetchWithAuth(`/manager/administrator/${id}/`, {
        method: "DELETE",
      }),
    getDepartmentPermission: (id: string) => fetchWithAuth(`/manager/permission/department/${id}/`),
    getAssociationPermission: (id: string) => fetchWithAuth(`/manager/permission/association/${id}/`),
    getServicePermission: (id: string) => fetchWithAuth(`/manager/permission/service/${id}/`),
    updateDepartmentPermission: (id: string, data: any) =>
      fetchWithAuth(`/manager/permission/department/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    updateAssociationPermission: (id: string, data: any) =>
      fetchWithAuth(`/manager/permission/association/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    updateServicePermission: (id: string, data: any) =>
      fetchWithAuth(`/manager/permission/service/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    deleteDepartmentPermission: (id: string) =>
      fetchWithAuth(`/manager/permission/department/${id}/`, {
        method: "DELETE",
      }),
    deleteAssociationPermission: (id: string) =>
      fetchWithAuth(`/manager/permission/association/${id}/`, {
        method: "DELETE",
      }),
    deleteServicePermission: (id: string) =>
      fetchWithAuth(`/manager/permission/service/${id}/`, {
        method: "DELETE",
      }),
    getCitizenRequests: (id: string) => fetchWithAuth(`/manager/citizen/${id}/requests/`),
    getCitizenGrants: (id: string) => fetchWithAuth(`/manager/citizen/${id}/grants/`),
    getGranteeServices: (id: string) => fetchWithAuth(`/manager/grantee/${id}/services/`),
    getGranteeAssociations: (id: string) => fetchWithAuth(`/manager/grantee/${id}/associations/`),
    deleteCitizen: (id: string) =>
      fetchWithAuth(`/manager/citizen/${id}/`, {
        method: "DELETE",
      }),
    createPermission: {
      service: async (data: any) => {
        return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manager/permission/service/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify(data),
        })
      },
      association: async (data: any) => {
        return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manager/permission/association/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify(data),
        })
      },
      department: async (data: any) => {
        return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manager/permission/department/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify(data),
        })
      },
    },
    getAssociations: async () => {
      return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manager/association/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
    },
    getGrant: (id: string) => {
      return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manager/grant/${id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
    },
    updateGrant: (id: string, data: any) => {
      return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manager/grant/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(data),
      })
    },
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
    getGrants: () => fetchWithAuth("/admin/grant/"),
    getProfile: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/admin/`, {
          headers: getAuthHeaders(),
        })

        if (response.ok) {
          const data = await response.json()
          // Handle both array and single object responses
          if (Array.isArray(data) && data.length > 0) {
            return new Response(JSON.stringify(data[0]), {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
            })
          } else if (!Array.isArray(data)) {
            return response
          }
        }
        return response
      } catch (error) {
        console.error("Error fetching admin profile:", error)
        throw error
      }
    },
    updateProfile: async (data: any) => {
      try {
        // First get the admin to find the ID
        const getResponse = await fetch(`${API_BASE_URL}/api/admin/admin/`, {
          headers: getAuthHeaders(),
        })

        if (getResponse.ok) {
          const adminData = await getResponse.json()
          let adminId

          if (Array.isArray(adminData) && adminData.length > 0) {
            adminId = adminData[0].id
          } else if (!Array.isArray(adminData) && adminData.id) {
            adminId = adminData.id
          }

          if (adminId) {
            const response = await fetch(`${API_BASE_URL}/api/admin/admin/${adminId}/`, {
              method: "PATCH",
              headers: {
                ...getAuthHeaders(),
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            })
            return response
          }
        }
        throw new Error("Admin not found")
      } catch (error) {
        console.error("Error updating admin profile:", error)
        throw error
      }
    },
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
    deleteService: (id: string) =>
      fetchWithAuth(`/admin/service/${id}/`, {
        method: "DELETE",
      }),
    deleteRequest: (id: string) =>
      fetchWithAuth(`/admin/request/${id}/`, {
        method: "DELETE",
      }),
    createDepartmentPermission: (data: any) =>
      fetchWithAuth("/admin/permission/department/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    createAssociationPermission: (data: any) =>
      fetchWithAuth("/admin/permission/association/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    createServicePermission: (data: any) =>
      fetchWithAuth("/admin/permission/service/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    createDepartment: (data: any) =>
      fetchWithAuth("/admin/department/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getAssociation: (id: string) => fetchWithAuth(`/admin/association/${id}/`),
    getRequest: (id: string) => fetchWithAuth(`/admin/request/${id}/`),
    getService: (id: string) => fetchWithAuth(`/admin/service/${id}/`),
    getDepartment: (id: string) => fetchWithAuth(`/admin/department/${id}/`),
    getCitizen: (id: string) => fetchWithAuth(`/admin/citizen/${id}/`),
    getGrantee: (id: string) => fetchWithAuth(`/admin/grantee/${id}/`),
    updateAssociation: (id: string, data: any) =>
      fetchWithAuth(`/admin/association/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    deleteAssociation: (id: string) =>
      fetchWithAuth(`/admin/association/${id}/`, {
        method: "DELETE",
      }),
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
    getAssociationServices: (id: string) => fetchWithAuth(`/admin/association/${id}/services/`),
    getAssociationGrantees: (id: string) => fetchWithAuth(`/admin/association/${id}/grantees/`),
    updateGrantee: (id: string, data: any) =>
      fetchWithAuth(`/admin/grantee/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    deleteGrantee: (id: string) =>
      fetchWithAuth(`/admin/grantee/${id}/`, {
        method: "DELETE",
      }),
    getDepartmentPermission: (id: string) => fetchWithAuth(`/admin/permission/department/${id}/`),
    getAssociationPermission: (id: string) => fetchWithAuth(`/admin/permission/association/${id}/`),
    getServicePermission: (id: string) => fetchWithAuth(`/admin/permission/service/${id}/`),
    updateDepartmentPermission: (id: string, data: any) =>
      fetchWithAuth(`/admin/permission/department/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    updateAssociationPermission: (id: string, data: any) =>
      fetchWithAuth(`/admin/permission/association/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    updateServicePermission: (id: string, data: any) =>
      fetchWithAuth(`/admin/permission/service/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    deleteDepartmentPermission: (id: string) =>
      fetchWithAuth(`/admin/permission/department/${id}/`, {
        method: "DELETE",
      }),
    deleteAssociationPermission: (id: string) =>
      fetchWithAuth(`/admin/permission/association/${id}/`, {
        method: "DELETE",
      }),
    deleteServicePermission: (id: string) =>
      fetchWithAuth(`/admin/permission/service/${id}/`, {
        method: "DELETE",
      }),
    getCitizenRequests: (id: string) => fetchWithAuth(`/admin/citizen/${id}/requests/`),
    getCitizenGrants: (id: string) => fetchWithAuth(`/admin/citizen/${id}/grants/`),
    getGranteeServices: (id: string) => fetchWithAuth(`/admin/grantee/${id}/services/`),
    getGranteeAssociations: (id: string) => fetchWithAuth(`/admin/grantee/${id}/associations/`),
    createPermission: {
      service: async (data: any) => {
        return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/permission/service/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify(data),
        })
      },
      association: async (data: any) => {
        return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/permission/association/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify(data),
        })
      },
      department: async (data: any) => {
        return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/permission/department/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify(data),
        })
      },
    },
    getGrant: (id: string) => {
      return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/grant/${id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
    },
    updateGrant: (id: string, data: any) => {
      return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/grant/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(data),
      })
    },
    // Functions to get services and associations with query parameters
    getServices: async (params?: Record<string, string>) => {
      // Convert params to URL query string if provided
      const queryParams = params
        ? "?" +
          Object.entries(params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join("&")
        : ""

      return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/service/${queryParams}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })
    },
    getGrantees: async (params?: Record<string, string>) => {
      // Convert params to URL query string if provided
      const queryParams = params
        ? "?" +
          Object.entries(params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join("&")
        : ""

      return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/grantee/${queryParams}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })
    },
    getAssociations: async (params?: Record<string, string>) => {
      // Convert params to URL query string if provided
      const queryParams = params
        ? "?" +
          Object.entries(params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join("&")
        : ""

      return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/association/${queryParams}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })
    },
    // Get services and associations related to a grantee
    getGranteeServices: async (id: string) => {
      // This uses the proper filtering format for related models
      return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/service/?Grantee__PublicId=${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })
    },
    getGranteeAssociations: async (id: string) => {
      // Use the proper filter format to get associations where this grantee is a member
      return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/association/?grantee__PublicId=${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })
    },
  },

  // Grantee endpoints
  grantee: {
    getCitizens: () => fetchWithAuth("/grantee/citizen/"),
    getDepartments: () => fetchWithAuth("/grantee/department/"),
    getAssociations: () => fetchWithAuth("/grantee/association/"),
    getServices: () => fetchWithAuth("/grantee/service/"),
    getRequests: () => fetchWithAuth("/grantee/request/"),
    getRequest: (id: string) => fetchWithAuth(`/grantee/request/${id}/`),
    getGrants: () => fetchWithAuth("/grantee/grant/"),
    getProfile: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/grantee/grantee/`, {
          headers: getAuthHeaders(),
        })

        if (response.ok) {
          const data = await response.json()
          // Handle both array and single object responses
          if (Array.isArray(data) && data.length > 0) {
            return new Response(JSON.stringify(data[0]), {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
            })
          } else if (!Array.isArray(data)) {
            return response
          }
        }
        return response
      } catch (error) {
        console.error("Error fetching grantee profile:", error)
        throw error
      }
    },
    updateProfile: async (data: any) => {
      try {
        // First get the grantee to find the ID
        const getResponse = await fetch(`${API_BASE_URL}/api/grantee/grantee/`, {
          headers: getAuthHeaders(),
        })

        if (getResponse.ok) {
          const granteeData = await getResponse.json()
          let granteeId

          if (Array.isArray(granteeData) && granteeData.length > 0) {
            granteeId = granteeData[0].id
          } else if (!Array.isArray(granteeData) && granteeData.id) {
            granteeId = granteeData.id
          }

          if (granteeId) {
            const response = await fetch(`${API_BASE_URL}/api/grantee/grantee/${granteeId}/`, {
              method: "PATCH",
              headers: {
                ...getAuthHeaders(),
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            })
            return response
          }
        }
        throw new Error("Grantee not found")
      } catch (error) {
        console.error("Error updating grantee profile:", error)
        throw error
      }
    },
    getReports: () => fetchWithAuth("/grantee/report/"),
    updateGrant: (id: string, data: any) =>
      fetchWithAuth(`/grantee/grant/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    createServicePermission: (data: any) =>
      fetchWithAuth("/grantee/permission/service/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getPermissions: () => fetchWithAuth("/grantee/permission/"),
    getPermission: (id: string) => fetchWithAuth(`/grantee/permission/${id}/`),
    updatePermission: (id: string, data: any) =>
      fetchWithAuth(`/grantee/permission/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    deletePermission: (id: string) =>
      fetchWithAuth(`/grantee/permission/${id}/`, {
        method: "DELETE",
      }),
    getCitizen: (id: string) => fetchWithAuth(`/grantee/citizen/${id}/`),
    getService: (id: string) => fetchWithAuth(`/grantee/service/${id}/`),
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
    createGrant: (data: any) =>
      fetchWithAuth(`/grantee/grant/`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    createPermission: {
      service: async (data: any) => {
        return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grantee/permission/service/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify(data),
        })
      },
    },
    getGrant: (id: string) => {
      return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grantee/grant/${id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
    },
    updateGrant: (id: string, data: any) => {
      return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grantee/grant/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(data),
      })
    },
  },
}
