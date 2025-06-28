"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Shield, Calendar, Clock, Users, Briefcase, XCircle, CheckCircle, Edit } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function GranteePermissionDetailPage() {
  const params = useParams()
  const permissionId = params?.id as string
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [permission, setPermission] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchPermissionDetails()
  }, [permissionId])

  const fetchPermissionDetails = async () => {
    if (!permissionId) return

    setIsLoading(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/grantee/permission/service/${permissionId}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to fetch permission details")
      }

      const data = await response.json()
      setPermission(data)
    } catch (error) {
      console.error("Error fetching permission details:", error)
      setError("Failed to load permission details. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = () => {
    if (!permission) return null

    const now = new Date()
    const startTime = new Date(permission.StartTime)
    const endTime = new Date(permission.EndTime)

    if (startTime > now) {
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800"
        >
          <Clock className="h-3.5 w-3.5 mr-1" />
          Upcoming
        </Badge>
      )
    } else if (endTime < now || !permission.PermissionOpen) {
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800"
        >
          <XCircle className="h-3.5 w-3.5 mr-1" />
          Expired
        </Badge>
      )
    } else {
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800"
        >
          <CheckCircle className="h-3.5 w-3.5 mr-1" />
          Active
        </Badge>
      )
    }
  }

  // Helper function to safely get citizens array
  const getCitizensArray = () => {
    if (!permission?.Citizens) return []
    if (Array.isArray(permission.Citizens)) return permission.Citizens
    if (typeof permission.Citizens === "object") return [permission.Citizens]
    return []
  }

  return (
    <DashboardLayout role="grantee">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/grantee/permissions">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Permission Details</h1>
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
        ) : permission ? (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">{permission.Name || "Unnamed Permission"}</CardTitle>
                  <CardDescription>Permission ID: {permission.id}</CardDescription>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  <Shield className="h-5 w-5" />
                  <span>Service Permission</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Description</h3>
                <p className="whitespace-pre-line">{permission.Description || "No description provided"}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Service</h3>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-slate-500" />
                    <p>{permission.PublicService?.Title || "Unknown Service"}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Status</h3>
                  {getStatusBadge()}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Start Time</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <p>{permission.StartTime ? new Date(permission.StartTime).toLocaleString() : "Not specified"}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">End Time</h3>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <p>{permission.EndTime ? new Date(permission.EndTime).toLocaleString() : "Not specified"}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Citizens with Access</h3>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-500" />
                  <p>{getCitizensArray().length} citizens</p>
                </div>
                {getCitizensArray().length > 0 && (
                  <div className="mt-2 space-y-1">
                    {getCitizensArray().map((citizen: any) => (
                      <div key={citizen.id} className="text-sm text-slate-600 dark:text-slate-300">
                        {citizen.UserName} ({citizen.Email})
                        {citizen.FirstName && (
                          <span className="text-xs text-slate-500 ml-2">
                            - {citizen.FirstName} {citizen.SecondName || ""}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Created</h3>
                  <p>{new Date(permission.Created).toLocaleString()}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Last Updated</h3>
                  <p>{new Date(permission.Updated).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link href="/grantee/permissions">Back to Permissions</Link>
                </Button>
                <Button asChild>
                  <Link href={`/grantee/permissions/${permission.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Permission
                  </Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ) : (
          <Alert>
            <AlertDescription>Permission not found</AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  )
}
