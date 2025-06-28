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
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { directApi } from "@/lib/api-direct"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function GranteeGrantEditPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [grant, setGrant] = useState<any>(null)
  const [formData, setFormData] = useState({
    Message: "",
    Decline: false,
    StartDate: "",
    EndDate: "",
  })

  useEffect(() => {
    if (params.id) {
      fetchGrant()
    }
  }, [params.id])

  const fetchGrant = async () => {
    setIsLoading(true)
    try {
      const response = await directApi.grantee.getGrant(params.id as string)
      if (response.ok) {
        const data = await response.json()
        setGrant(data)
        setFormData({
          Message: data.Message || "",
          Decline: data.Decline || false,
          StartDate: data.StartDate ? new Date(data.StartDate).toISOString().slice(0, 16) : "",
          EndDate: data.EndDate ? new Date(data.EndDate).toISOString().slice(0, 16) : "",
        })
      } else {
        throw new Error("Failed to fetch grant")
      }
    } catch (error) {
      console.error("Error fetching grant:", error)
      toast({
        title: "Error",
        description: "Failed to load grant details. Please try again.",
        variant: "destructive",
      })
      router.push("/grantee/grants")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const updateData = {
        Message: formData.Message,
        Decline: formData.Decline,
        StartDate: formData.StartDate ? new Date(formData.StartDate).toISOString() : null,
        EndDate: formData.EndDate ? new Date(formData.EndDate).toISOString() : null,
      }

      const response = await directApi.grantee.updateGrant(params.id as string, updateData)

      if (response.ok) {
        toast({
          title: "Success",
          description: "Grant updated successfully.",
        })
        router.push(`/grantee/grants/${params.id}`)
      } else {
        throw new Error("Failed to update grant")
      }
    } catch (error) {
      console.error("Error updating grant:", error)
      toast({
        title: "Error",
        description: "Failed to update grant. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (isLoading) {
    return (
      <DashboardLayout role="grantee">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-8"></div>
            <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!grant) {
    return (
      <DashboardLayout role="grantee">
        <div className="flex flex-col items-center justify-center py-10">
          <h2 className="text-2xl font-bold mb-2">Grant not found</h2>
          <p className="text-muted-foreground mb-4">The grant you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/grantee/grants">Back to Grants</Link>
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="grantee">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/grantee/grants/${params.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Grant
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Grant</h1>
            <p className="text-muted-foreground">Update grant information and status</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Grant Details</CardTitle>
            <CardDescription>Update the grant information. Changes will be saved immediately.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter grant message..."
                  value={formData.Message}
                  onChange={(e) => handleInputChange("Message", e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="decline"
                  checked={formData.Decline}
                  onCheckedChange={(checked) => handleInputChange("Decline", checked)}
                />
                <Label htmlFor="decline">Decline this grant</Label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.StartDate}
                    onChange={(e) => handleInputChange("StartDate", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.EndDate}
                    onChange={(e) => handleInputChange("EndDate", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" asChild>
                  <Link href={`/grantee/grants/${params.id}`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
