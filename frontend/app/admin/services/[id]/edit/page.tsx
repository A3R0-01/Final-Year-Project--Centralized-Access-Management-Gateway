"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Briefcase } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export default function AdminEditServicePage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params?.id as string
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [service, setService] = useState<any>(null)
  const [associations, setAssociations] = useState<any[]>([])
  const [grantees, setGrantees] = useState<any[]>([])
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    Title: "",
    MachineName: "",
    Description: "",
    Email: "",
    URL: "",
    Association: "",
    Grantee: [] as string[],
    Restricted: false,
    Visibility: true,
  })

  useEffect(() => {
    if (serviceId) {
      fetchServiceDetails()
      fetchAssociations()
      fetchGrantees()
    }
  }, [serviceId])

  const fetchServiceDetails = async () => {
    if (!serviceId) return

    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/service/${serviceId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch service details")
      }

      const data = await response.json()
      setService(data)

      // Initialize form with service data
      setFormData({
        Title: data.Title || "",
        MachineName: data.MachineName || "",
        Description: data.Description || "",
        URL: data.URL || "",
        Email: data.Email || "",
        Association: data.Association?.id || "",
        Grantee: data.Grantee?.map((g: any) => g.id) || [],
        Restricted: data.Restricted || false,
        Visibility: data.Visibility !== undefined ? data.Visibility : true,
      })
    } catch (error) {
      console.error("Error fetching service details:", error)
      setError("Failed to load service details. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAssociations = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/association/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch associations")
      }

      const data = await response.json()
      setAssociations(data)
    } catch (error) {
      console.error("Error fetching associations:", error)
      toast({
        title: "Error",
        description: "Failed to load associations. Some features may be limited.",
        variant: "destructive",
      })
    }
  }

  const fetchGrantees = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/grantee/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch grantees")
      }

      const data = await response.json()
      setGrantees(data)
    } catch (error) {
      console.error("Error fetching grantees:", error)
      toast({
        title: "Error",
        description: "Failed to load grantees. Some features may be limited.",
        variant: "destructive",
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAssociationChange = (value: string) => {
    setFormData((prev) => ({ ...prev, Association: value }))
  }

  const handleGranteeChange = (value: string) => {
    setFormData((prev) => {
      const currentGrantees = [...prev.Grantee]
      if (currentGrantees.includes(value)) {
        return { ...prev, Grantee: currentGrantees.filter((id) => id !== value) }
      } else {
        return { ...prev, Grantee: [...currentGrantees, value] }
      }
    })
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/service/${serviceId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to update service")
      }

      toast({
        title: "Service updated",
        description: "The service has been updated successfully.",
        variant: "default",
      })

      router.push(`/admin/services/${serviceId}`)
    } catch (error: any) {
      console.error("Error updating service:", error)
      setError(error.message || "Failed to update service. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/services/${serviceId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Service</h1>
        </div>

        {isLoading ? (
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
        ) : error && !service ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : service ? (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">Edit {service.Title}</CardTitle>
                  <CardDescription>Update service details and information</CardDescription>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  <Briefcase className="h-5 w-5" />
                  <span>Service</span>
                </div>
              </div>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div>
                  <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="Title">Service Name</Label>
                      <Input
                        id="Title"
                        name="Title"
                        value={formData.Title}
                        onChange={handleChange}
                        placeholder="e.g. Passport Application"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="MachineName">Machine Name</Label>
                      <Input
                        id="MachineName"
                        name="MachineName"
                        value={formData.MachineName}
                        onChange={handleChange}
                        placeholder="e.g. passport_application"
                      />
                      <p className="text-xs text-muted-foreground">
                        System identifier, will be generated if not provided
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="Email">Contact Email</Label>
                      <Input
                        id="Email"
                        name="Email"
                        type="email"
                        value={formData.Email}
                        onChange={handleChange}
                        placeholder="service@example.gov"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="URL">Website URL (Optional)</Label>
                      <Input
                        id="URL"
                        name="URL"
                        type="url"
                        value={formData.URL}
                        onChange={handleChange}
                        placeholder="https://service.gov"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="Description">Description</Label>
                      <Textarea
                        id="Description"
                        name="Description"
                        value={formData.Description}
                        onChange={handleChange}
                        placeholder="Describe the service's purpose and requirements"
                        rows={4}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Association & Access</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="Association">Association</Label>
                      <Select value={formData.Association} onValueChange={handleAssociationChange} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an association" />
                        </SelectTrigger>
                        <SelectContent>
                          {associations.map((association) => (
                            <SelectItem key={association.id} value={association.id}>
                              {association.Title} ({association.Department?.Title || "No Department"})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Service Settings</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="Restricted"
                            checked={formData.Restricted}
                            onCheckedChange={(checked) => handleSwitchChange("Restricted", checked)}
                          />
                          <Label htmlFor="Restricted">Restricted Access</Label>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          If enabled, only users with explicit permissions can access this service
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Switch
                          id="Visibility"
                          checked={formData.Visibility}
                          onCheckedChange={(checked) => handleSwitchChange("Visibility", checked)}
                        />
                        <Label htmlFor="Visibility">Visible to Public</Label>
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Assign Grantees</Label>
                      <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                        {grantees.length > 0 ? (
                          <div className="space-y-2">
                            {grantees.map((grantee) => (
                              <div key={grantee.id} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`grantee-${grantee.id}`}
                                  checked={formData.Grantee.includes(grantee.id)}
                                  onChange={() => handleGranteeChange(grantee.id)}
                                  className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label htmlFor={`grantee-${grantee.id}`} className="text-sm font-normal cursor-pointer">
                                  {grantee.GranteeUserName} ({grantee.Association?.Title || "No Association"})
                                </Label>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No grantees available. Create grantees first.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" asChild>
                  <Link href={`/admin/services/${serviceId}`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        ) : (
          <Alert>
            <AlertDescription>Service not found</AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  )
}
