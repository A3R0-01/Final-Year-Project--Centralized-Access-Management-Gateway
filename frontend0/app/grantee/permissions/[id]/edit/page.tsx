"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Save, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"

export default function EditPermissionPage() {
  const params = useParams()
  const router = useRouter()
  const permissionId = params?.id as string
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [citizens, setCitizens] = useState<any[]>([])
  const [citizenSearchQuery, setCitizenSearchQuery] = useState("")
  const [filteredCitizens, setFilteredCitizens] = useState<any[]>([])

  const [formData, setFormData] = useState({
    Name: "",
    Description: "",
    Citizens: [] as string[],
    StartTime: "",
    EndTime: "",
  })

  useEffect(() => {
    fetchPermissionDetails()
    fetchCitizens()
  }, [permissionId])

  useEffect(() => {
    // Filter citizens based on search query
    if (citizens.length > 0) {
      const filtered = citizens.filter(
        (citizen) =>
          citizen.UserName?.toLowerCase().includes(citizenSearchQuery.toLowerCase()) ||
          citizen.Email?.toLowerCase().includes(citizenSearchQuery.toLowerCase()) ||
          (citizen.FirstName && citizen.FirstName.toLowerCase().includes(citizenSearchQuery.toLowerCase())) ||
          (citizen.SecondName && citizen.SecondName.toLowerCase().includes(citizenSearchQuery.toLowerCase())),
      )
      setFilteredCitizens(filtered)
    }
  }, [citizenSearchQuery, citizens])

  const fetchCitizens = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grantee/citizen/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setCitizens(Array.isArray(data) ? data : [])
        setFilteredCitizens(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Error fetching citizens:", error)
    }
  }

  const fetchPermissionDetails = async () => {
    if (!permissionId) return

    setIsLoading(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/grantee/permission/service/${permissionId}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to fetch permission details")
      }

      const data = await response.json()

      // Format dates for datetime-local input
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return ""
        const date = new Date(dateString)
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      }

      // Handle Citizens data - it could be an array of objects or IDs
      let citizenIds: string[] = []
      if (data.Citizens) {
        if (Array.isArray(data.Citizens)) {
          // If it's an array of objects with id property
          citizenIds = data.Citizens.map((citizen: any) => {
            if (typeof citizen === "object" && citizen.id) {
              return citizen.id
            }
            // If it's already an array of IDs
            return citizen
          }).filter(Boolean)
        } else if (typeof data.Citizens === "object") {
          // If it's a single object, extract the id
          citizenIds = data.Citizens.id ? [data.Citizens.id] : []
        }
      }

      setFormData({
        Name: data.Name || "",
        Description: data.Description || "",
        Citizens: citizenIds,
        StartTime: formatDateForInput(data.StartTime),
        EndTime: formatDateForInput(data.EndTime),
      })
    } catch (error) {
      console.error("Error fetching permission details:", error)
      setError("Failed to load permission details. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCitizenToggle = (citizenId: string) => {
    setFormData((prev) => ({
      ...prev,
      Citizens: prev.Citizens.includes(citizenId)
        ? prev.Citizens.filter((id) => id !== citizenId)
        : [...prev.Citizens, citizenId],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!formData.Name.trim()) {
        throw new Error("Permission name is required")
      }
      if (!formData.Description.trim()) {
        throw new Error("Description is required")
      }
      if (!formData.StartTime) {
        throw new Error("Start time is required")
      }
      if (!formData.EndTime) {
        throw new Error("End time is required")
      }

      // Convert the form data to match the API expectations
      const permissionData = {
        Name: formData.Name.trim(),
        Description: formData.Description.trim(),
        Citizens: formData.Citizens,
        StartTime: new Date(formData.StartTime).toISOString(),
        EndTime: new Date(formData.EndTime).toISOString(),
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/grantee/permission/service/${permissionId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify(permissionData),
        },
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || errorData.message || "Failed to update permission")
      }

      toast({
        title: "Permission updated",
        description: "The service permission has been updated successfully.",
        variant: "default",
      })

      router.push(`/grantee/permissions/${permissionId}`)
    } catch (error: any) {
      console.error("Error updating permission:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update permission. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout role="grantee">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/grantee/permissions/${permissionId}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Edit Permission</h1>
          </div>
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout role="grantee">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/grantee/permissions/${permissionId}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Edit Permission</h1>
          </div>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="grantee">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/grantee/permissions/${permissionId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Permission</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Service Permission</CardTitle>
            <CardDescription>
              Update the details of this service permission. Note that the service cannot be changed after creation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="Name">Permission Name</Label>
                <Input
                  id="Name"
                  name="Name"
                  value={formData.Name}
                  onChange={handleChange}
                  placeholder="e.g. Passport Application Access"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="Description">Description</Label>
                <Textarea
                  id="Description"
                  name="Description"
                  value={formData.Description}
                  onChange={handleChange}
                  placeholder="Describe the purpose of this permission"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Citizens</Label>
                <div className="border rounded-md">
                  <div className="p-2 border-b">
                    <Input
                      type="search"
                      placeholder="Search citizens..."
                      value={citizenSearchQuery}
                      onChange={(e) => setCitizenSearchQuery(e.target.value)}
                    />
                  </div>
                  <ScrollArea className="h-72">
                    <div className="p-2">
                      {filteredCitizens.length > 0 ? (
                        filteredCitizens.map((citizen) => (
                          <div key={citizen.id} className="flex items-center space-x-2 py-2">
                            <Checkbox
                              id={`citizen-${citizen.id}`}
                              checked={formData.Citizens.includes(citizen.id)}
                              onCheckedChange={() => handleCitizenToggle(citizen.id)}
                            />
                            <Label htmlFor={`citizen-${citizen.id}`} className="flex-1 cursor-pointer">
                              <div className="font-medium">{citizen.UserName}</div>
                              <div className="text-sm text-muted-foreground">{citizen.Email}</div>
                              {citizen.FirstName && (
                                <div className="text-sm text-muted-foreground">
                                  {citizen.FirstName} {citizen.SecondName || ""}
                                </div>
                              )}
                            </Label>
                          </div>
                        ))
                      ) : (
                        <div className="py-4 text-center text-muted-foreground">
                          {citizens.length === 0 ? "Loading citizens..." : "No citizens found"}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  <div className="p-2 border-t bg-muted/50">
                    <div className="text-sm text-muted-foreground">{formData.Citizens.length} citizens selected</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="StartTime">Start Date & Time</Label>
                  <Input
                    id="StartTime"
                    name="StartTime"
                    type="datetime-local"
                    value={formData.StartTime}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="EndTime">End Date & Time</Label>
                  <Input
                    id="EndTime"
                    name="EndTime"
                    type="datetime-local"
                    value={formData.EndTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href={`/grantee/permissions/${permissionId}`}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
