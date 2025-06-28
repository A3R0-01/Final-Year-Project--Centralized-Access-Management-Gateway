"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, XCircle, Clock, Calendar, Eye } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { directApi } from "@/lib/api-direct"

export default function CitizenGrantsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  const [isLoading, setIsLoading] = useState(true)
  const [grants, setGrants] = useState<any[]>([])
  const [error, setError] = useState("")

  // Check if user is authenticated and has the citizen role
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "citizen")) {
      toast({
        title: "Access denied",
        description: "You must be logged in as a citizen to view grants.",
        variant: "destructive",
      })
      router.push("/auth/login?role=citizen")
    }
  }, [user, authLoading, router, toast])

  useEffect(() => {
    const fetchGrants = async () => {
      if (!user || user.role !== "citizen") return

      try {
        console.log("Fetching citizen grants...")
        setIsLoading(true)

        const response = await directApi.citizen.getGrants()

        if (response.ok) {
          const data = await response.json()
          console.log("Grants fetched successfully:", data)
          setGrants(data)
          setError("")
        } else {
          throw new Error("Failed to fetch grants")
        }
      } catch (error: any) {
        console.error("Error fetching grants:", error)
        setError(error.message || "Failed to load grants. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (user && user.role === "citizen") {
      fetchGrants()
    }
  }, [user])

  const getGrantStatusIcon = (grant: any) => {
    if (grant.Decline) {
      return <XCircle className="h-5 w-5 text-red-500" />
    } else if (grant.Granted) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    } else {
      return <Clock className="h-5 w-5 text-amber-500" />
    }
  }

  const getGrantStatusText = (grant: any) => {
    if (grant.Decline) {
      return "Declined"
    } else if (grant.Granted) {
      return "Active"
    } else {
      return "Pending"
    }
  }

  const getGrantStatusBadge = (grant: any) => {
    if (grant.Decline) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Declined
        </Badge>
      )
    } else if (grant.Granted) {
      return (
        <Badge variant="default" className="bg-green-600 hover:bg-green-700 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Active
        </Badge>
      )
    } else {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      )
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // If still loading auth, show loading state
  if (authLoading) {
    return (
      <DashboardLayout role="citizen">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // If not a citizen, don't render the content
  if (!user || user.role !== "citizen") {
    return null // The useEffect will handle the redirect
  }

  return (
    <DashboardLayout role="citizen">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Grants</h1>
            <p className="text-muted-foreground">View and manage your service access grants</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : grants.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No grants found</h3>
              <p className="text-muted-foreground text-center mb-4">
                You don't have any grants yet. Submit a request for a restricted service to get started.
              </p>
              <Button asChild>
                <Link href="/citizen/services">Browse Services</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {grants.map((grant) => (
              <Card key={grant.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{grant.Request?.Subject || "Grant"}</CardTitle>
                      <CardDescription className="text-sm">
                        Service: {grant.Request?.PublicService?.Title || "N/A"}
                      </CardDescription>
                    </div>
                    {getGrantStatusBadge(grant)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Message</p>
                    <p className="text-sm line-clamp-2">{grant.Message || "No message provided"}</p>
                  </div>

                  {grant.StartDate && grant.EndDate && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Valid Period</span>
                      </div>
                      <div className="text-sm">
                        <p>From: {formatDate(grant.StartDate)}</p>
                        <p>To: {formatDate(grant.EndDate)}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Link href={`/citizen/requests/${grant.Request?.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View Request
                      </Link>
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Created: {formatDate(grant.Created)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
