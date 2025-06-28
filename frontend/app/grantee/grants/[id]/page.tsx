"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { directApi } from "@/lib/api-direct"
import { ArrowLeft, Edit, CheckCircle, XCircle, Calendar, User, FileText, Clock } from "lucide-react"
import Link from "next/link"

export default function GranteeGrantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [grant, setGrant] = useState<any>(null)

  useEffect(() => {
    if (params.id) {
      fetchGrant()
    }
  }, [params.id])

  const fetchGrant = async () => {
    setIsLoading(true)
    try {
      const response = await directApi.grantee.getGrant(params.id as string)
      if (response.ok) {
        const data = await response.json()
        setGrant(data)
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
      router.push("/grantee/grants")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (grant: any) => {
    if (grant.Decline) {
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800"
        >
          <XCircle className="h-3.5 w-3.5 mr-1" />
          Declined
        </Badge>
      )
    } else if (grant.Granted) {
      if (grant.EndDate && new Date(grant.EndDate) < new Date()) {
        return (
          <Badge
            variant="outline"
            className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700"
          >
            <Calendar className="h-3.5 w-3.5 mr-1" />
            Expired
          </Badge>
        )
      }
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800"
        >
          <CheckCircle className="h-3.5 w-3.5 mr-1" />
          Active
        </Badge>
      )
    } else {
      return (
        <Badge
          variant="outline"
          className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800"
        >
          <Calendar className="h-3.5 w-3.5 mr-1" />
          Pending
        </Badge>
      )
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout role="grantee">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!grant) {
    return (
      <DashboardLayout role="grantee">
        <div className="flex flex-col items-center justify-center py-10">
          <h2 className="text-2xl font-bold mb-2">Grant not found</h2>
          <p className="text-muted-foreground mb-4">The grant you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/grantee/grants">Back to Grants</Link>
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="grantee">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/grantee/grants">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Grants
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Grant Details</h1>
              <p className="text-muted-foreground">View and manage grant information</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(grant)}
            <Button asChild>
              <Link href={`/grantee/grants/${grant.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Grant
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Grant Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Message</label>
                <p className="mt-1">{grant.Message || "No message provided"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Declined</label>
                <p className="mt-1">{grant.Decline ? "Yes" : "No"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Granted</label>
                <p className="mt-1">{grant.Granted ? "Yes" : "No"}</p>
              </div>
              {grant.Grantee && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Grantee</label>
                  <p className="mt-1">{grant.Grantee.GranteeUserName || "Unknown"}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                <p className="mt-1">{grant.StartDate ? new Date(grant.StartDate).toLocaleString() : "Not set"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">End Date</label>
                <p className="mt-1">{grant.EndDate ? new Date(grant.EndDate).toLocaleString() : "Not set"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="mt-1">{new Date(grant.Created).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="mt-1">{new Date(grant.Updated).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {grant.Request && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Request Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Subject</label>
                    <p className="mt-1">{grant.Request.Subject || "Unknown"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Citizen</label>
                    <p className="mt-1">{grant.Request.Citizen || "Unknown"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Public Service</label>
                    <p className="mt-1">{grant.Request.PublicService || "Unknown"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
