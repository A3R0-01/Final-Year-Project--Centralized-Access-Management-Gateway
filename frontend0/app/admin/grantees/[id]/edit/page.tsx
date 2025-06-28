"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { directApi } from "@/lib/api-direct"
import { ArrowLeft, Save } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Citizen {
  id: string
  UserName: string
  FirstName: string
  SecondName?: string
  Surname: string
  Email: string
  NationalId: string
}

interface Association {
  id: string
  Title: string
  Email: string
  Department: {
    id: string
    Title: string
  }
}

interface Grantee {
  id: string
  GranteeUserName: string
  Citizen: Citizen
  Association: Association
  FirstEmail: string
  SecondEmail?: string
  Created: string
  Updated: string
}

export default function EditGranteePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [grantee, setGrantee] = useState<Grantee | null>(null)
  const [citizens, setCitizens] = useState<Citizen[]>([])
  const [associations, setAssociations] = useState<Association[]>([])

  const [formData, setFormData] = useState({
    GranteeUserName: "",
    Citizen: "",
    Association: "",
    FirstEmail: "",
    SecondEmail: "",
    password: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch grantee details
        const granteeResponse = await directApi.admin.getGrantee(params.id)
        if (!granteeResponse.ok) {
          throw new Error("Failed to fetch grantee")
        }
        const granteeData = await granteeResponse.json()
        setGrantee(granteeData)

        // Fetch citizens
        const citizensResponse = await directApi.admin.getCitizens()
        if (citizensResponse.ok) {
          const citizensData = await citizensResponse.json()
          setCitizens(citizensData)
        }

        // Fetch associations
        const associationsResponse = await directApi.admin.getAssociations()
        if (associationsResponse.ok) {
          const associationsData = await associationsResponse.json()
          setAssociations(associationsData)
        }

        // Set form data
        setFormData({
          GranteeUserName: granteeData.GranteeUserName || "",
          Citizen: granteeData.Citizen?.id || "",
          Association: granteeData.Association?.id || "",
          FirstEmail: granteeData.FirstEmail || "",
          SecondEmail: granteeData.SecondEmail || "",
          password: "",
        })
      } catch (err: any) {
        console.error("Error fetching data:", err)
        setError(err.message || "Failed to load data")
        toast({
          title: "Error",
          description: "Failed to load grantee data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, toast])

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      // Validate required fields
      if (!formData.GranteeUserName.trim()) {
        throw new Error("Grantee Username is required")
      }
      if (!formData.Citizen) {
        throw new Error("Citizen is required")
      }
      if (!formData.Association) {
        throw new Error("Association is required")
      }
      if (!formData.FirstEmail.trim()) {
        throw new Error("First Email is required")
      }

      // Prepare data for submission
      const submitData = {
        GranteeUserName: formData.GranteeUserName,
        Citizen: formData.Citizen,
        Association: formData.Association,
        FirstEmail: formData.FirstEmail,
        SecondEmail: formData.SecondEmail || null,
        ...(formData.password && { password: formData.password }),
      }

      const response = await directApi.admin.updateGrantee(params.id, submitData)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to update grantee")
      }

      toast({
        title: "Success",
        description: "Grantee updated successfully",
      })

      router.push("/admin/grantees")
    } catch (err: any) {
      console.error("Error updating grantee:", err)
      setError(err.message || "Failed to update grantee")
      toast({
        title: "Error",
        description: err.message || "Failed to update grantee",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="container mx-auto py-6 space-y-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Edit Grantee</h1>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="admin">
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Edit Grantee</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Grantee Information</CardTitle>
            <CardDescription>Update the grantee details below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="GranteeUserName">Grantee Username *</Label>
                  <Input
                    id="GranteeUserName"
                    value={formData.GranteeUserName}
                    onChange={(e) => handleChange("GranteeUserName", e.target.value)}
                    disabled={submitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Citizen">Citizen *</Label>
                  <Select
                    value={formData.Citizen}
                    onValueChange={(value) => handleChange("Citizen", value)}
                    disabled={submitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a citizen" />
                    </SelectTrigger>
                    <SelectContent>
                      {citizens.map((citizen) => (
                        <SelectItem key={citizen.id} value={citizen.id}>
                          {citizen.FirstName} {citizen.SecondName} {citizen.Surname} ({citizen.UserName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Association">Association *</Label>
                  <Select
                    value={formData.Association}
                    onValueChange={(value) => handleChange("Association", value)}
                    disabled={submitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an association" />
                    </SelectTrigger>
                    <SelectContent>
                      {associations.map((association) => (
                        <SelectItem key={association.id} value={association.id}>
                          {association.Title} - {association.Department.Title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="FirstEmail">First Email *</Label>
                  <Input
                    id="FirstEmail"
                    type="email"
                    value={formData.FirstEmail}
                    onChange={(e) => handleChange("FirstEmail", e.target.value)}
                    disabled={submitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="SecondEmail">Second Email</Label>
                  <Input
                    id="SecondEmail"
                    type="email"
                    value={formData.SecondEmail}
                    onChange={(e) => handleChange("SecondEmail", e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    disabled={submitting}
                    placeholder="Leave empty to keep current password"
                  />
                  <p className="text-sm text-gray-500">
                    Leave empty to keep the current password. Minimum 8 characters if changing.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Changes"}
                  {!submitting && <Save className="ml-2 h-4 w-4" />}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
