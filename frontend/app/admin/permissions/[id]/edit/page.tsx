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
import { ArrowLeft, Shield } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { directApi } from "@/lib/api-direct"

export default function EditPermissionPage() {
  const params = useParams()
  const permissionId = params?.id as string
  const router = useRouter()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [permissionType, setPermissionType] = useState<"department" | "association" | "service" | null>(null)

  const [formData, setFormData] = useState({
    Name: "",
    Description: "",
    StartTime: "",
    EndTime: "",
    Active: false,
  })

  useEffect(() => {
    fetchPermissionDetails()
  }, [permissionId])

  const fetchPermissionDetails = async () => {
    if (!permissionId) return

    setIsLoading(true)
    try {
      // Try department permission first
      let response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/permission/department/${permissionId}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      )

      if (response.ok) {
        const data = await response.json()
        setPermissionType("department")
        setFormData({
          Name: data.Name || "",
          Description: data.Description || "",
          StartTime: data.StartTime ? new Date(data.StartTime).toISOString().slice(0, 16) : "",
          EndTime: data.EndTime ? new Date(data.EndTime).toISOString().slice(0, 16) : "",
          Active: data.Active || false,
        })
        return
      }

      // Try association permission
      response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/permission/association/${permissionId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPermissionType("association")
        setFormData({
          Name: data.Name || "",
          Description: data.Description || "",
          StartTime: data.StartTime ? new Date(data.StartTime).toISOString().slice(0, 16) : "",
          EndTime: data.EndTime ? new Date(data.EndTime).toISOString().slice(0, 16) : "",
          Active: data.Active || false,
        })
        return
      }

      // Try service permission
      response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/permission/service/${permissionId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPermissionType("service")
        setFormData({
          Name: data.Name || "",
          Description: data.Description || "",
          StartTime: data.StartTime ? new Date(data.StartTime).toISOString().slice(0, 16) : "",
          EndTime: data.EndTime ? new Date(data.EndTime).toISOString().slice(0, 16) : "",
          Active: data.Active || false,
        })
        return
      }

      throw new Error("Failed to fetch permission details")
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      if (!permissionType) {
        throw new Error("Permission type not determined")
      }

      // Validate required fields
      if (!formData.Name || !formData.Description || !formData.StartTime || !formData.EndTime) {
        throw new Error("All required fields must be filled")
      }

      let response
      const updateData = {
        Name: formData.Name,
        Description: formData.Description,
        StartTime: formData.StartTime,
        EndTime: formData.EndTime,
        Active: formData.Active,
      }

      // Use the correct endpoint based on permission type
      if (permissionType === "department") {
        response = await directApi.admin.updateDepartmentPermission(permissionId, updateData)
      } else if (permissionType === "association") {
        response = await directApi.admin.updateAssociationPermission(permissionId, updateData)
      } else if (permissionType === "service") {
        response = await directApi.admin.updateServicePermission(permissionId, updateData)
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to update permission")
      }

      toast({
        title: "Permission updated",
        description: "The permission has been updated successfully.",
        variant: "default",
      })

      router.push(`/admin/permissions/${permissionId}`)
    } catch (error: any) {
      console.error("Error updating permission:", error)
      setError(error.message || "Failed to update permission. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/permissions/${permissionId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Permission</h1>
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
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">Edit Permission Details</CardTitle>
                  <CardDescription>Update the permission information</CardDescription>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  <Shield className="h-5 w-5" />
                  <span>Permission</span>
                </div>
              </div>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="Name">Permission Name</Label>
                    <Input
                      id="Name"
                      name="Name"
                      value={formData.Name}
                      onChange={handleChange}
                      placeholder="e.g. Special Access"
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="Description">Description</Label>
                    <Textarea
                      id="Description"
                      name="Description"
                      value={formData.Description}
                      onChange={handleChange}
                      placeholder="Describe the purpose of this permission"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="StartTime">Start Time</Label>
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
                    <Label htmlFor="EndTime">End Time</Label>
                    <Input
                      id="EndTime"
                      name="EndTime"
                      type="datetime-local"
                      value={formData.EndTime}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="Active"
                        name="Active"
                        checked={formData.Active}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <Label htmlFor="Active">Active</Label>
                    </div>
                    <p className="text-sm text-gray-500">Enable or disable this permission</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" asChild>
                  <Link href={`/admin/permissions/${permissionId}`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
