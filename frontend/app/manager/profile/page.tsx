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
import { User, Mail, Shield, Calendar, BadgeIcon as IdCard, Save } from "lucide-react"
import { format } from "date-fns"

export default function ManagerProfilePage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profile, setProfile] = useState<any>({})
  const [formData, setFormData] = useState({
    FirstEmail: "",
    SecondEmail: "",
    ManagerUserName: "",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      const response = await directApi.manager.getProfile()
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFormData({
          FirstEmail: data.FirstEmail || "",
          SecondEmail: data.SecondEmail || "",
          ManagerUserName: data.ManagerUserName || "",
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
        FirstEmail: formData.FirstEmail,
        SecondEmail: formData.SecondEmail || null,
        ManagerUserName: formData.ManagerUserName,
        ...(formData.password ? { password: formData.password } : {}),
      }

      const response = await directApi.manager.updateProfile(apiData)
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
    <DashboardLayout role="manager">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">View and manage your site manager account information</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(6)].map((_, i) => (
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
                <CardDescription>Your site manager account details and personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium">Manager Username</p>
                    <p className="text-sm text-slate-500">{profile.ManagerUserName}</p>
                  </div>
                </div>
                {profile.Citizen && (
                  <>
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-slate-500" />
                      <div>
                        <p className="text-sm font-medium">Full Name</p>
                        <p className="text-sm text-slate-500">
                          {`${profile.Citizen.FirstName} ${profile.Citizen.SecondName ? profile.Citizen.SecondName + " " : ""}${profile.Citizen.Surname}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-slate-500" />
                      <div>
                        <p className="text-sm font-medium">Citizen Username</p>
                        <p className="text-sm text-slate-500">{profile.Citizen.UserName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <IdCard className="h-5 w-5 text-slate-500" />
                      <div>
                        <p className="text-sm font-medium">National ID</p>
                        <p className="text-sm text-slate-500">{profile.Citizen.NationalId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-slate-500" />
                      <div>
                        <p className="text-sm font-medium">Date of Birth</p>
                        <p className="text-sm text-slate-500">
                          {profile.Citizen.DOB ? format(new Date(profile.Citizen.DOB), "PPP") : "Not provided"}
                        </p>
                      </div>
                    </div>
                  </>
                )}
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium">Primary Email</p>
                    <p className="text-sm text-slate-500">{profile.FirstEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium">Secondary Email</p>
                    <p className="text-sm text-slate-500">{profile.SecondEmail || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium">Role</p>
                    <p className="text-sm text-slate-500">Site Manager</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>Update your account information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ManagerUserName">Manager Username</Label>
                    <Input
                      id="ManagerUserName"
                      name="ManagerUserName"
                      value={formData.ManagerUserName}
                      onChange={handleChange}
                      placeholder="manager_username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="FirstEmail">Primary Email</Label>
                    <Input
                      id="FirstEmail"
                      name="FirstEmail"
                      type="email"
                      value={formData.FirstEmail}
                      onChange={handleChange}
                      placeholder="primary@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="SecondEmail">Secondary Email (Optional)</Label>
                    <Input
                      id="SecondEmail"
                      name="SecondEmail"
                      type="email"
                      value={formData.SecondEmail || ""}
                      onChange={handleChange}
                      placeholder="secondary@example.com"
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
