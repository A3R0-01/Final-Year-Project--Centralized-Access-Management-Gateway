"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { directApi } from "@/lib/api-direct"
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ManagerEditGranteePage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [grantee, setGrantee] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [associations, setAssociations] = useState<any[]>([])
  const [administrators, setAdministrators] = useState<any[]>([])
  const [citizens, setCitizens] = useState<any[]>([])
  const [formData, setFormData] = useState({
    GranteeUserName: "",
    FirstEmail: "",
    SecondEmail: "",
    Association: "",
    Administrator: "",
    Citizen: "",
    password: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch grantee details
        const granteeResponse = await directApi.manager.getGrantee(id as string)
        if (granteeResponse.ok) {
          const granteeData = await granteeResponse.json()
          setGrantee(granteeData)
          setFormData({
            GranteeUserName: granteeData.GranteeUserName || "",
            FirstEmail: granteeData.FirstEmail || "",
            SecondEmail: granteeData.SecondEmail || "",
            Association: granteeData.Association?.id || "",
            Administrator: granteeData.Administrator?.id || "",
            Citizen: granteeData.Citizen?.id || "",
            password: "",
          })
        }

        // Fetch associations, administrators, and citizens for dropdowns
        const [assocResponse, adminResponse, citizenResponse] = await Promise.all([
          directApi.manager.getAssociations(),
          directApi.manager.getAdministrators(),
          directApi.manager.getCitizens(),
        ])

        if (assocResponse.ok) {
          const assocData = await assocResponse.json()
          setAssociations(assocData)
        }

        if (adminResponse.ok) {
          const adminData = await adminResponse.json()
          setAdministrators(adminData)
        }

        if (citizenResponse.ok) {
          const citizenData = await citizenResponse.json()
          setCitizens(citizenData)
        }
      } catch (err: any) {
        console.error("Error fetching data:", err)
        toast({
          title: "Error",
          description: "Failed to load grantee details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const updateData: any = {
        GranteeUserName: formData.GranteeUserName,
        FirstEmail: formData.FirstEmail,
        SecondEmail: formData.SecondEmail || null,
        Association: formData.Association,
        Administrator: formData.Administrator,
        Citizen: formData.Citizen,
      }

      // Only include password if it's provided
      if (formData.password && formData.password.trim() !== "") {
        updateData.password = formData.password
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manager/grantee/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to update grantee")
      }

      toast({
        title: "Success",
        description: "Grantee updated successfully",
      })

      router.push(`/manager/grantees/${id}`)
    } catch (error: any) {
      console.error("Error updating grantee:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update grantee. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="manager">
        <div className="container mx-auto py-6 space-y-8">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="animate-pulse">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="h-7 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <Card>
            <CardContent className="space-y-4 p-6">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="manager">
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Edit Grantee</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Grantee Information</CardTitle>
            <CardDescription>Update grantee details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="GranteeUserName">Username</Label>
                  <Input
                    id="GranteeUserName"
                    name="GranteeUserName"
                    value={formData.GranteeUserName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="FirstEmail">Primary Email</Label>
                  <Input
                    id="FirstEmail"
                    name="FirstEmail"
                    type="email"
                    value={formData.FirstEmail}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="SecondEmail">Secondary Email</Label>
                  <Input
                    id="SecondEmail"
                    name="SecondEmail"
                    type="email"
                    value={formData.SecondEmail}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Association">Association</Label>
                  <Select
                    value={formData.Association}
                    onValueChange={(value) => handleSelectChange("Association", value)}
                    required
                  >
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
                  <Label htmlFor="Administrator">Administrator</Label>
                  <Select
                    value={formData.Administrator}
                    onValueChange={(value) => handleSelectChange("Administrator", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an administrator" />
                    </SelectTrigger>
                    <SelectContent>
                      {administrators.map((admin) => (
                        <SelectItem key={admin.id} value={admin.id}>
                          {admin.AdministratorUserName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Citizen">Citizen</Label>
                  <Select
                    value={formData.Citizen}
                    onValueChange={(value) => handleSelectChange("Citizen", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a citizen" />
                    </SelectTrigger>
                    <SelectContent>
                      {citizens.map((citizen) => (
                        <SelectItem key={citizen.id} value={citizen.id}>
                          {citizen.UserName} - {citizen.FirstName} {citizen.Surname}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">New Password (optional)</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Leave empty to keep current password"
                      minLength={8}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">Password must be at least 8 characters long</p>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
