"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Clock, CheckCircle, XCircle, Calendar, Edit } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function GrantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const grantId = params?.id as string
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [grant, setGrant] = useState<any>(null)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("details")

  useEffect(() => {
    fetchGrantDetails()
  }, [grantId])

  const fetchGrantDetails = async () => {
    if (!grantId) return

    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manager/grant/${grantId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch grant details")
      }

      const data = await response.json()
      setGrant(data)
    } catch (error) {
      console.error("Error fetching grant details:", error)
      setError("Failed to load grant details. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = () => {
    if (!grant) return null

    if (grant.Decline) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1.5">
          <XCircle className="h-3.5 w-3.5" />
          <span>Declined</span>
        </Badge>
      )
    } else if (grant.Granted) {
      if (grant.EndDate && new Date(grant.EndDate) < new Date()) {
        return (
          <Badge variant="outline" className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>Expired</span>
          </Badge>
        )
      }
      return (
        <Badge
          variant="success"
          className="flex items-center gap-1.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
        >
          <CheckCircle className="h-3.5 w-3.5" />
          <span>Active</span>
        </Badge>
      )
    } else {
      return (
        <Badge
          variant="secondary"
          className="flex items-center gap-1.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
        >
          <Clock className="h-3.5 w-3.5" />
          <span>Pending</span>
        </Badge>
      )
    }
  }

  return (
    <DashboardLayout role="manager">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/manager/grants">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Grant Details</h1>
          </div>
          {grant && (
            <Button asChild>
              <Link href={`/manager/grants/${grantId}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Grant
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
        ) : grant ? (
          <>
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">
                      {grant.Request?.Subject || `Grant #${grant.id.substring(0, 8)}`}
                    </CardTitle>
                    <CardDescription>Grant ID: {grant.id}</CardDescription>
                  </div>
                  {getStatusBadge()}
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details" onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="details">Grant Details</TabsTrigger>
                    <TabsTrigger value="request">Request Info</TabsTrigger>
                    <TabsTrigger value="grantee">Grantee Info</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="mt-4 space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Message</h3>
                      <p className="whitespace-pre-line">{grant.Message || "No message provided"}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Validity Period</h3>
                      <p>
                        From: {grant.StartDate ? new Date(grant.StartDate).toLocaleDateString() : "N/A"}
                        <br />
                        To: {grant.EndDate ? new Date(grant.EndDate).toLocaleDateString() : "N/A"}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Status</h3>
                      <p>
                        {grant.Decline
                          ? "Declined"
                          : grant.Granted && grant.EndDate && new Date(grant.EndDate) < new Date()
                            ? "Expired"
                            : grant.Granted
                              ? "Active"
                              : "Pending"}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Created</h3>
                      <p>{new Date(grant.Created).toLocaleString()}</p>
                    </div>

                    {grant.Updated && (
                      <div>
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Last Updated</h3>
                        <p>{new Date(grant.Updated).toLocaleString()}</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="request" className="mt-4 space-y-4">
                    {grant.Request ? (
                      <>
                        <div>
                          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Subject</h3>
                          <p>{grant.Request.Subject || "N/A"}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Citizen</h3>
                          <p>{grant.Request.Citizen || "N/A"}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Service</h3>
                          <p>{grant.Request.PublicService || "N/A"}</p>
                        </div>

                        <Button asChild variant="outline">
                          <Link href={`/manager/requests/${grant.Request.id}`}>View Request Details</Link>
                        </Button>
                      </>
                    ) : (
                      <p>No request information available for this grant.</p>
                    )}
                  </TabsContent>

                  <TabsContent value="grantee" className="mt-4 space-y-4">
                    {grant.Grantee ? (
                      <>
                        <div>
                          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Username</h3>
                          <p>{grant.Grantee.GranteeUserName || "N/A"}</p>
                        </div>

                        <Button asChild variant="outline">
                          <Link href={`/manager/grantees/${grant.Grantee.id}`}>View Grantee Details</Link>
                        </Button>
                      </>
                    ) : (
                      <p>No grantee assigned to this grant.</p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button asChild variant="outline">
                  <Link href="/manager/grants">Back to Grants</Link>
                </Button>
                <Button asChild>
                  <Link href={`/manager/grants/${grantId}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Grant
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </>
        ) : (
          <Alert>
            <AlertDescription>Grant not found</AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  )
}
