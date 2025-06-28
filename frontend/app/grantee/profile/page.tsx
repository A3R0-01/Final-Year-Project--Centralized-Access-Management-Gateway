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
import { User, Mail, Building, Save } from "lucide-react"

export default function GranteeProfilePage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profile, setProfile] = useState<any>({})
  const [formData, setFormData] = useState({
    FirstEmail: "",
    SecondEmail: "",
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      const response = await directApi.grantee.getProfile()
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFormData({
          FirstEmail: data.FirstEmail || "",
          SecondEmail: data.SecondEmail || "",
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

    try {
      const response = await directApi.grantee.updateProfile(formData)
      if (response.ok) {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
          variant: "default",
        })
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
    <DashboardLayout role="grantee">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">View and manage your grantee account information</p>

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
                <CardDescription>Your grantee account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium">Username</p>
                    <p className="text-sm text-slate-500">{profile.GranteeUserName}</p>
                  </div>
                </div>
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
                  <Building className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium">Association</p>
                    <p className="text-sm text-slate-500">{profile.Association?.Title || "Not assigned"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>Update your contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="FirstEmail">Primary Email</Label>
                    <Input
                      id="FirstEmail"
                      name="FirstEmail"
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
                      value={formData.SecondEmail || ""}
                      onChange={handleChange}
                      placeholder="secondary@example.com"
                    />
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
