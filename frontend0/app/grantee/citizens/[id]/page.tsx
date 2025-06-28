"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, User, Mail, BadgeIcon as IdCard, Calendar, Edit } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function CitizenDetailPage() {
  const params = useParams()
  const citizenId = params?.id as string
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [citizen, setCitizen] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchCitizenDetails()
  }, [citizenId])

  const fetchCitizenDetails = async () => {
    if (!citizenId) return

    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grantee/citizen/${citizenId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch citizen details")
      }

      const data = await response.json()
      setCitizen(data)
    } catch (error) {
      console.error("Error fetching citizen details:", error)
      setError("Failed to load citizen details. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout role="grantee">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/grantee/citizens">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Citizen Details</h1>
          </div>
          {citizen && (
            <Button asChild>
              <Link href={`/grantee/citizens/${citizenId}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Password
              </Link>
            </Button>
          )}
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
        ) : citizen ? (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <User className="h-6 w-6" />
                    {citizen.FirstName} {citizen.SecondName} {citizen.Surname}
                  </CardTitle>
                  <CardDescription>Citizen Profile Information</CardDescription>
                </div>
                <Badge variant={citizen.is_active ? "default" : "secondary"}>
                  {citizen.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-slate-500" />
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Username</h3>
                      <p className="font-medium">{citizen.UserName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-slate-500" />
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Email</h3>
                      <p>{citizen.Email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <IdCard className="h-5 w-5 text-slate-500" />
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">National ID</h3>
                      <p>{citizen.NationalId}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-slate-500" />
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Date of Birth</h3>
                      <p>{citizen.DOB ? new Date(citizen.DOB).toLocaleDateString() : "N/A"}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Account Status</h3>
                    <Badge variant={citizen.is_active ? "default" : "secondary"}>
                      {citizen.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Email Verified</h3>
                    <Badge variant={citizen.EmailVerified ? "default" : "secondary"}>
                      {citizen.EmailVerified ? "Verified" : "Not Verified"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Created</h3>
                    <p>{new Date(citizen.Created).toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Last Updated</h3>
                    <p>{new Date(citizen.Updated).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button asChild variant="outline">
                  <Link href="/grantee/citizens">Back to Citizens</Link>
                </Button>
                <Button asChild>
                  <Link href={`/grantee/citizens/${citizenId}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Password
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Alert>
            <AlertDescription>Citizen not found</AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  )
}
