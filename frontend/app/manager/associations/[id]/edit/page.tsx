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
import { directApi } from "@/lib/api-direct"
import { ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export default function EditAssociationPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [departments, setDepartments] = useState<any[]>([])

  const [formData, setFormData] = useState({
    Title: "",
    Description: "",
    Department: "",
    Active: true,
  })

  useEffect(() => {
    if (params.id) {
      fetchAssociationDetails()
      fetchDepartments()
    }
  }, [params.id])

  const fetchAssociationDetails = async () => {
    try {
      const response = await directApi.manager.getAssociation(params.id as string)
      if (response.ok) {
        const data = await response.json()
        setFormData({
          Title: data.Title || "",
          Description: data.Description || "",
          Department: data.Department?.id || "",
          Active: data.Active || false,
        })
      } else {
        throw new Error("Failed to fetch association details")
      }
    } catch (error) {
      console.error("Error fetching association details:", error)
      toast({
        title: "Error",
        description: "Failed to load association details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await directApi.manager.getDepartments()
      if (response.ok) {
        const data = await response.json()
        setDepartments(data)
      } else {
        throw new Error("Failed to fetch departments")
      }
    } catch (error) {
      console.error("Error fetching departments:", error)
      toast({
        title: "Error",
        description: "Failed to load departments. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDepartmentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, Department: value }))
  }

  const handleActiveChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, Active: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.Title.trim()) {
      setError("Association name is required")
      return
    }

    if (!formData.Department) {
      setError("Please select a department")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await directApi.manager.updateAssociation(params.id as string, formData)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to update association")
      }

      toast({
        title: "Association updated",
        description: "The association has been updated successfully.",
        variant: "default",
      })

      router.push(`/manager/associations/${params.id}`)
    } catch (error: any) {
      console.error("Error updating association:", error)
      setError(error.message || "Failed to update association. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout role="manager">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/manager/associations/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Association</h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Association Details</CardTitle>
              <CardDescription>Update the association information</CardDescription>
            </CardHeader>

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
                  placeholder="Enter association name"
                  disabled={isLoading || isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="Description">Description</Label>
                <Textarea
                  id="Description"
                  name="Description"
                  value={formData.Description}
                  onChange={handleChange}
                  placeholder="Enter association description"
                  rows={4}
                  disabled={isLoading || isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="Department">Department</Label>
                <Select
                  value={formData.Department}
                  onValueChange={handleDepartmentChange}
                  disabled={isLoading || isSubmitting}
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
                {isLoading && <p className="text-xs text-muted-foreground">Loading departments...</p>}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="Active"
                  checked={formData.Active}
                  onCheckedChange={handleActiveChange}
                  disabled={isLoading || isSubmitting}
                />
                <Label htmlFor="Active">Active</Label>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href={`/manager/associations/${params.id}`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={isLoading || isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}
