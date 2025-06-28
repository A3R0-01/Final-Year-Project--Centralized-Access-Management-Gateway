"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { directApi } from "@/lib/api-direct"
import { ArrowLeft, Clock, CheckCircle, XCircle, User, Mail, BadgeIcon as IdCard, Award } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"

export default function RequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const requestId = params?.id as string
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useAuth()

  const [isLoading, setIsLoading] = useState(true)
  const [request, setRequest] = useState<any>(null)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("details")

  // Check if user is authenticated and has the grantee role
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "grantee")) {
      toast({
        title: "Access denied",
        description: "You must be logged in as a grantee to view this page.",
        variant: "destructive",
      })
      router.push("/auth/login?role=grantee")
    }
  }, [user, authLoading, router, toast])

  useEffect(() => {
    if (requestId && user && user.role === "grantee") {
      fetchRequestDetails()
    }
  }, [requestId, user])

  const fetchRequestDetails = async () => {
    if (!requestId) return

    setIsLoading(true)
    try {
      const response = await directApi.grantee.getRequest(requestId)

      if (!response.ok) {
        throw new Error("Failed to fetch request details")
      }

      const data = await response.json()
      setRequest(data)
    } catch (error) {
      console.error("Error fetching request details:", error)
      setError("Failed to load request details. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = () => {
    if (!request) return null

    if (request.Decline) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
          <XCircle className="h-5 w-5" />
          <span>Rejected</span>
        </div>
      )
    } else if (request.Granted) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <CheckCircle className="h-5 w-5" />
          <span>Approved</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          <Clock className="h-5 w-5" />
          <span>Pending</span>
        </div>
      )
    }
  }

  // If still loading auth, show loading state
  if (authLoading) {
    return (
      <DashboardLayout role="grantee">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // If not a grantee, don't render the content
  if (!user || user.role !== "grantee") {
    return null // The useEffect will handle the redirect
  }

  return (
    <DashboardLayout role="grantee">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/grantee/requests">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Request Details</h1>
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
        ) : request ? (
          <>
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">{request.Subject}</CardTitle>
                    <CardDescription>Request ID: {request.id}</CardDescription>
                  </div>
                  {getStatusBadge()}
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details" onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="details">Request Details</TabsTrigger>
                    <TabsTrigger value="citizen">Citizen Info</TabsTrigger>
                    {request.grant && <TabsTrigger value="grant">Grant Details</TabsTrigger>}
                  </TabsList>

                  <TabsContent value="details" className="mt-4 space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Message</h3>
                      <p className="whitespace-pre-line">{request.Message}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Service</h3>
                      <p className="font-medium">{request.PublicService?.Title || "N/A"}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {request.PublicService?.Association?.Title || "N/A"} •{" "}
                        {request.PublicService?.Association?.Department?.Title || "N/A"}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Submitted</h3>
                      <p>{new Date(request.Created).toLocaleString()}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="citizen" className="mt-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-slate-500" />
                      <div>
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Name</h3>
                        <p>{`${request.Citizen?.FirstName || ""} ${request.Citizen?.SecondName || ""} ${request.Citizen?.Surname || ""}`}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-slate-500" />
                      <div>
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Email</h3>
                        <p>{request.Citizen?.Email || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <IdCard className="h-5 w-5 text-slate-500" />
                      <div>
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">National ID</h3>
                        <p>{request.Citizen?.NationalId || "N/A"}</p>
                      </div>
                    </div>

                    <Button asChild variant="outline">
                      <Link href={`/grantee/citizens/${request.Citizen?.id}`}>View Full Profile</Link>
                    </Button>
                  </TabsContent>

                  {request.grant && (
                    <TabsContent value="grant" className="mt-4 space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Status</h3>
                        <p className="font-medium">
                          {request.grant.Decline ? "Rejected" : request.grant.granted ? "Approved" : "Pending"}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Message</h3>
                        <p className="whitespace-pre-line">{request.grant?.Message || "No message provided"}</p>
                      </div>

                      {request.grant.granted && (
                        <>
                          <div>
                            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                              Validity Period
                            </h3>
                            <p>
                              From:{" "}
                              {request.grant?.StartDate
                                ? new Date(request.grant.StartDate).toLocaleDateString()
                                : "N/A"}
                              <br />
                              To:{" "}
                              {request.grant?.EndDate ? new Date(request.grant.EndDate).toLocaleDateString() : "N/A"}
                            </p>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                              Processed On
                            </h3>
                            <p>{request.grant?.Created ? new Date(request.grant.Created).toLocaleString() : "N/A"}</p>
                          </div>
                        </>
                      )}

                      <div className="pt-4">
                        <Button asChild>
                          <Link href={`/grantee/grants/${request.grant.id}/edit`}>Edit Grant</Link>
                        </Button>
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
              <CardFooter>
                {!request.grant && (
                  <Alert className="w-full">
                    <AlertDescription>
                      This request needs to be processed. Please go to the grants section to create a grant for this
                      request.
                    </AlertDescription>
                  </Alert>
                )}
                {request.grant && (
                  <div className="flex justify-end w-full">
                    <Button asChild variant="outline">
                      <Link href={`/grantee/grants/${request.grant.id}`}>
                        <Award className="mr-2 h-4 w-4" />
                        View Grant Details
                      </Link>
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          </>
        ) : (
          <Alert>
            <AlertDescription>Request not found</AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  )
}
