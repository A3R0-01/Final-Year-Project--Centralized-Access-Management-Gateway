"use client"

import type React from "react"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { directApi } from "@/lib/api-direct"
import { User, Mail, Calendar, BadgeIcon as IdCard, Save } from "lucide-react"
import { format } from "date-fns"

export default function CitizenProfilePage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profile, setProfile] = useState<any>({})
  const [formData, setFormData] = useState({
    Email: "",
    FirstName: "",
    SecondName: "",
    Surname: "",
    UserName: "",
    NationalId: "",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      const response = await directApi.citizen.getProfile()
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFormData({
          Email: data.Email || "",
          FirstName: data.FirstName || "",
          SecondName: data.SecondName || "",
          Surname: data.Surname || "",
          UserName: data.UserName || "",
          NationalId: data.NationalId || "",
          password: "",
          confirmPassword: "",
        })
      } else {
        throw new Error("Failed to fetch profile")
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate passwords if provided
    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }
    }

    try {
      // Transform data to match API expectations
      const apiData = {
        Email: formData.Email,
        FirstName: formData.FirstName,
        SecondName: formData.SecondName || null,
        Surname: formData.Surname,
        UserName: formData.UserName,
        NationalId: formData.NationalId,
        ...(formData.password ? { password: formData.password } : {}),
      }

      const response = await directApi.citizen.updateProfile(apiData)
      if (response.ok) {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
          variant: "default",
        })
        // Reset password fields
        setFormData((prev) => ({
          ...prev,
          password: "",
          confirmPassword: "",
        }))
        fetchProfile()
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout role="citizen">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">View and manage your personal information</p>

        {isLoading ? (
          <div className="space-y-4">
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/5"></div>
                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your account details and personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium">Username</p>
                    <p className="text-sm text-slate-500">{profile.UserName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-slate-500">{profile.Email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium">Date of Birth</p>
                    <p className="text-sm text-slate-500">
                      {profile.DOB ? format(new Date(profile.DOB), "PPP") : "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <IdCard className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium">National ID</p>
                    <p className="text-sm text-slate-500">{profile.NationalId}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="UserName">Username</Label>
                    <Input
                      id="UserName"
                      name="UserName"
                      value={formData.UserName}
                      onChange={handleChange}
                      placeholder="johndoe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="Email">Email</Label>
                    <Input
                      id="Email"
                      name="Email"
                      value={formData.Email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="FirstName">First Name</Label>
                    <Input
                      id="FirstName"
                      name="FirstName"
                      value={formData.FirstName}
                      onChange={handleChange}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="SecondName">Middle Name (Optional)</Label>
                    <Input
                      id="SecondName"
                      name="SecondName"
                      value={formData.SecondName || ""}
                      onChange={handleChange}
                      placeholder="Robert"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="Surname">Surname</Label>
                    <Input
                      id="Surname"
                      name="Surname"
                      value={formData.Surname}
                      onChange={handleChange}
                      placeholder="Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="NationalId">National ID</Label>
                    <Input
                      id="NationalId"
                      name="NationalId"
                      value={formData.NationalId}
                      onChange={handleChange}
                      placeholder="ID12345678"
                    />
                  </div>
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium mb-3">Change Password</h3>
                    <div className="space-y-2">
                      <Label htmlFor="password">New Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave password fields empty if you don't want to change it
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
