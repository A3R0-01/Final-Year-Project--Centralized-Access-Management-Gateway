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
import { ArrowLeft, Building } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function EditDepartmentPage() {
  const params = useParams()
  const router = useRouter()
  const departmentId = params?.id as string
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [department, setDepartment] = useState<any>(null)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    Title: "",
    Email: "",
    Telephone: "",
    Website: "",
    Description: "",
  })

  useEffect(() => {
    fetchDepartmentDetails()
  }, [departmentId])

  const fetchDepartmentDetails = async () => {
    if (!departmentId) return

    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manager/department/${departmentId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch department details")
      }

      const data = await response.json()
      setDepartment(data)

      // Initialize form with department data
      setFormData({
        Title: data.Title || "",
        Email: data.Email || "",
        Telephone: data.Telephone || "",
        Website: data.Website || "",
        Description: data.Description || "",
      })

      console.log("Department data loaded:", data)
    } catch (error) {
      console.error("Error fetching department details:", error)
      setError("Failed to load department details. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    console.log("Submitting department update with data:", formData)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manager/department/${departmentId}/`, {
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
        throw new Error(errorData.detail || "Failed to update department")
      }

      const updatedData = await response.json()
      console.log("Department updated successfully:", updatedData)

      toast({
        title: "Department updated",
        description: "The department has been updated successfully.",
        variant: "default",
      })

      router.push(`/manager/departments/${departmentId}`)
    } catch (error: any) {
      console.error("Error updating department:", error)
      setError(error.message || "Failed to update department. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout role="manager">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/manager/departments/${departmentId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Department</h1>
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
        ) : error && !department ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : department ? (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">Edit {department.Title}</CardTitle>
                  <CardDescription>Update department details and information</CardDescription>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                  <Building className="h-5 w-5" />
                  <span>Department</span>
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
                  <Label htmlFor="Title">Department Name</Label>
                  <Input
                    id="Title"
                    name="Title"
                    value={formData.Title}
                    onChange={handleChange}
                    placeholder="e.g. Ministry of Interior"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Email">Email</Label>
                  <Input
                    id="Email"
                    name="Email"
                    type="email"
                    value={formData.Email}
                    onChange={handleChange}
                    placeholder="department@example.gov"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Telephone">Telephone</Label>
                  <Input
                    id="Telephone"
                    name="Telephone"
                    value={formData.Telephone}
                    onChange={handleChange}
                    placeholder="+1234567890"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Website">Website</Label>
                  <Input
                    id="Website"
                    name="Website"
                    type="url"
                    value={formData.Website}
                    onChange={handleChange}
                    placeholder="https://department.gov"
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
                    placeholder="Describe the department's purpose and responsibilities"
                    rows={4}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" asChild>
                  <Link href={`/manager/departments/${departmentId}`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        ) : (
          <Alert>
            <AlertDescription>Department not found</AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  )
}
