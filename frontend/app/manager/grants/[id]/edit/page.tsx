"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Award } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { directApi } from "@/lib/api-direct"

export default function ManagerEditGrantPage() {
  const router = useRouter()
  const params = useParams()
  const grantId = params.id as string
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [grant, setGrant] = useState<any>(null)

  const [formData, setFormData] = useState({
    Status: "",
    Notes: "",
    Amount: "",
    StartDate: "",
    EndDate: "",
    Message: "",
    Decline: false,
    Grantee: "",
  })

  useEffect(() => {
    if (grantId) {
      fetchGrant()
    }
  }, [grantId])

  const fetchGrant = async () => {
    try {
      setIsLoading(true)
      const response = await directApi.manager.getGrant(grantId)
      if (response.ok) {
        const grant = await response.json()
        setGrant(grant)

        // Format dates for datetime-local input
        const formatDate = (dateString: string) => {
          if (!dateString) return ""
          const date = new Date(dateString)
          return date.toISOString().slice(0, 16) // Format as YYYY-MM-DDTHH:MM
        }

        setFormData({
          Status: grant.Status || "",
          Notes: grant.Notes || "",
          Amount: grant.Amount?.toString() || "",
          StartDate: formatDate(grant.StartDate),
          EndDate: formatDate(grant.EndDate),
          Message: grant.Message || "",
          Decline: grant.Decline || false,
          Grantee: grant.Grantee?.id || "",
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
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, Status: value }))
  }

  const handleDeclineChange = (value: string) => {
    setFormData((prev) => ({ ...prev, Decline: value === "true" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // Validate required fields
      if (!formData.Message) {
        throw new Error("Message is required")
      }

      // Convert amount to number if provided
      const data: any = { ...formData }
      if (data.Amount) {
        data.Amount = Number.parseFloat(data.Amount)
        if (isNaN(data.Amount)) {
          throw new Error("Amount must be a valid number")
        }
      }

      const response = await directApi.manager.updateGrant(grantId, data)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to update grant")
      }

      toast({
        title: "Grant updated",
        description: "The grant has been updated successfully.",
        variant: "default",
      })

      router.push(`/manager/grants/${grantId}`)
    } catch (error: any) {
      console.error("Error updating grant:", error)
      setError(error.message || "Failed to update grant. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout role="manager">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p>Loading grant details...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!grant) {
    return (
      <DashboardLayout role="manager">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Grant Not Found</h2>
            <p className="mt-2">The requested grant could not be found.</p>
            <Button asChild className="mt-4">
              <Link href="/manager/grants">Back to Grants</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="manager">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/manager/grants/${grantId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Grant</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">Grant Details</CardTitle>
                <CardDescription>Update grant information and status</CardDescription>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                <Award className="h-5 w-5" />
                <span>Grant #{grant.id.substring(0, 8)}</span>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="Status">Status</Label>
                  <Select value={formData.Status} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Decline">Approve/Reject</Label>
                  <Select value={formData.Decline.toString()} onValueChange={handleDeclineChange} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select approval status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Approve</SelectItem>
                      <SelectItem value="true">Reject</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Amount">Amount</Label>
                  <Input
                    id="Amount"
                    name="Amount"
                    type="number"
                    step="0.01"
                    value={formData.Amount}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="StartDate">Start Date</Label>
                  <Input
                    id="StartDate"
                    name="StartDate"
                    type="datetime-local"
                    value={formData.StartDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="EndDate">End Date</Label>
                  <Input
                    id="EndDate"
                    name="EndDate"
                    type="datetime-local"
                    value={formData.EndDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="Message">Message</Label>
                  <Textarea
                    id="Message"
                    name="Message"
                    value={formData.Message}
                    onChange={handleChange}
                    placeholder="Add a message about this grant"
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="Notes">Additional Notes</Label>
                  <Textarea
                    id="Notes"
                    name="Notes"
                    value={formData.Notes}
                    onChange={handleChange}
                    placeholder="Add notes about this grant"
                    rows={4}
                  />
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Request Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Citizen:</p>
                    <p>
                      {grant.Request?.Citizen?.FirstName} {grant.Request?.Citizen?.Surname}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Service:</p>
                    <p>{grant.Request?.PublicService?.Title}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Request Created:</p>
                    <p>{grant.Request?.Created ? new Date(grant.Request.Created).toLocaleString() : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Grant Created:</p>
                    <p>{new Date(grant.Created).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" asChild>
                <Link href={`/manager/grants/${grantId}`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Grant"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}
