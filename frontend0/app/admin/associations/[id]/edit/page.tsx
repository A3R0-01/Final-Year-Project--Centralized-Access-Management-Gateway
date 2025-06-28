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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Building2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function AdminEditAssociationPage() {
  const params = useParams()
  const router = useRouter()
  const associationId = params?.id as string
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [association, setAssociation] = useState<any>(null)
  const [departments, setDepartments] = useState<any[]>([])
  const [error, setError] = useState("")

  // Initialize form with all required fields
  const [formData, setFormData] = useState({
    Title: "",
    Description: "",
    Email: "",
    Website: "",
    Department: "",
  })

  useEffect(() => {
    fetchDepartments()
    fetchAssociationDetails()
  }, [associationId])

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/department/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch departments")
      }

      const data = await response.json()
      setDepartments(data)
    } catch (error) {
      console.error("Error fetching departments:", error)
      setError("Failed to load departments. Please try again.")
    }
  }

  const fetchAssociationDetails = async () => {
    if (!associationId) return

    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/association/${associationId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch association details")
      }

      const data = await response.json()
      setAssociation(data)

      // Initialize form with all association data fields
      setFormData({
        Title: data.Title || "",
        Description: data.Description || "",
        Email: data.Email || "",
        Website: data.Website || "",
        Department: data.Department?.id || "",
      })

      console.log("Association data loaded:", data)
    } catch (error) {
      console.error("Error fetching association details:", error)
      setError("Failed to load association details. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    // Log the data being sent to the API
    console.log("Submitting association update with data:", formData)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/association/${associationId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API error response:", errorData)
        throw new Error(errorData.detail || "Failed to update association")
      }

      const updatedData = await response.json()
      console.log("Association updated successfully:", updatedData)

      toast({
        title: "Association updated",
        description: "The association has been updated successfully.",
        variant: "default",
      })

      router.push(`/admin/associations/${associationId}`)
    } catch (error: any) {
      console.error("Error updating association:", error)
      setError(error.message || "Failed to update association. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/associations/${associationId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Association</h1>
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
        ) : error && !association ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : association ? (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">Edit {association.Title}</CardTitle>
                  <CardDescription>Update association details and information</CardDescription>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                  <Building2 className="h-5 w-5" />
                  <span>Association</span>
                </div>
              </div>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="Title">Association Name</Label>
                  <Input
                    id="Title"
                    name="Title"
                    value={formData.Title}
                    onChange={handleChange}
                    placeholder="e.g. Health Services Association"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Department">Department</Label>
                  <Select
                    value={formData.Department}
                    onValueChange={(value) => handleSelectChange("Department", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.Title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Email">Email</Label>
                  <Input
                    type="email"
                    id="Email"
                    name="Email"
                    value={formData.Email}
                    onChange={handleChange}
                    placeholder="e.g. contact@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Website">Website (Optional)</Label>
                  <Input
                    type="url"
                    id="Website"
                    name="Website"
                    value={formData.Website}
                    onChange={handleChange}
                    placeholder="e.g. https://www.example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Description">Description</Label>
                  <Textarea
                    id="Description"
                    name="Description"
                    value={formData.Description}
                    onChange={handleChange}
                    placeholder="Describe the association's purpose and responsibilities"
                    rows={4}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" asChild>
                  <Link href={`/admin/associations/${associationId}`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        ) : (
          <Alert>
            <AlertDescription>Association not found</AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  )
}
