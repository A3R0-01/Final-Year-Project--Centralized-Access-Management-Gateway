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
import { Switch } from "@/components/ui/switch"

export default function ManagerEditCitizenPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [citizen, setCitizen] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    UserName: "",
    Email: "",
    FirstName: "",
    SecondName: "",
    Surname: "",
    DOB: "",
    NationalId: "",
    is_active: true,
    password: "",
  })

  useEffect(() => {
    const fetchCitizen = async () => {
      try {
        setLoading(true)
        const response = await directApi.manager.getCitizen(id as string)
        if (response.ok) {
          const data = await response.json()
          setCitizen(data)
          setFormData({
            UserName: data.UserName || "",
            Email: data.Email || "",
            FirstName: data.FirstName || "",
            SecondName: data.SecondName || "",
            Surname: data.Surname || "",
            DOB: data.DOB ? data.DOB.split("T")[0] : "",
            NationalId: data.NationalId || "",
            is_active: data.is_active ?? true,
            password: "",
          })
        } else {
          throw new Error("Failed to fetch citizen details")
        }
      } catch (err: any) {
        console.error("Error fetching citizen:", err)
        toast({
          title: "Error",
          description: "Failed to load citizen details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchCitizen()
    }
  }, [id, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_active: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const updateData: any = {
        UserName: formData.UserName,
        Email: formData.Email,
        FirstName: formData.FirstName,
        SecondName: formData.SecondName,
        Surname: formData.Surname,
        DOB: formData.DOB ? new Date(formData.DOB).toISOString() : null,
        NationalId: formData.NationalId,
        is_active: formData.is_active,
      }

      // Only include password if it's provided
      if (formData.password && formData.password.trim() !== "") {
        updateData.password = formData.password
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manager/citizen/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error("Failed to update citizen")
      }

      toast({
        title: "Success",
        description: "Citizen updated successfully",
      })

      router.push(`/manager/citizens/${id}`)
    } catch (error: any) {
      console.error("Error updating citizen:", error)
      toast({
        title: "Error",
        description: "Failed to update citizen. Please try again.",
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
              {[1, 2, 3, 4, 5].map((i) => (
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
            <h1 className="text-2xl font-bold">Edit Citizen</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Citizen Information</CardTitle>
            <CardDescription>Update citizen details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="UserName">Username</Label>
                  <Input
                    id="UserName"
                    name="UserName"
                    value={formData.UserName}
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="FirstName">First Name</Label>
                  <Input
                    id="FirstName"
                    name="FirstName"
                    value={formData.FirstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="SecondName">Second Name</Label>
                  <Input id="SecondName" name="SecondName" value={formData.SecondName} onChange={handleInputChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Surname">Surname</Label>
                  <Input id="Surname" name="Surname" value={formData.Surname} onChange={handleInputChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="NationalId">National ID</Label>
                  <Input
                    id="NationalId"
                    name="NationalId"
                    value={formData.NationalId}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="DOB">Date of Birth</Label>
                  <Input id="DOB" name="DOB" type="date" value={formData.DOB} onChange={handleInputChange} required />
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

                <div className="flex items-center space-x-2">
                  <Switch id="is_active" checked={formData.is_active} onCheckedChange={handleSwitchChange} />
                  <Label htmlFor="is_active">Active</Label>
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
