"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Clock, CheckCircle, XCircle, ExternalLink } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { directApi } from "@/lib/api-direct"

export default function RequestDetailPage() {
  const params = useParams()
  const requestId = params?.id as string
  const { toast } = useToast()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  const [isLoading, setIsLoading] = useState(true)
  const [request, setRequest] = useState<any>(null)
  const [error, setError] = useState("")
  const [retryCount, setRetryCount] = useState(0)
  const [isAccessingService, setIsAccessingService] = useState(false)

  // Check if user is authenticated and has the citizen role
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "citizen")) {
      toast({
        title: "Access denied",
        description: "You must be logged in as a citizen to view request details.",
        variant: "destructive",
      })
      router.push("/auth/login?role=citizen")
    }
  }, [user, authLoading, router, toast])

  useEffect(() => {
    const fetchRequestDetails = async () => {
      if (!user || user.role !== "citizen") return

      try {
        console.log(`Fetching request details for ID: ${requestId}`)
        setIsLoading(true)

        // Use a try-catch block specifically for the API call
        try {
          const response = await directApi.citizen.getRequest(requestId)

          const data = await response.json()
          console.log("Request details fetched successfully:", data)
          setRequest(data)
          setError("")
        } catch (apiError: any) {
          console.error("API call failed:", apiError)

          // If it's a 404, we might want to retry
          if (apiError.message.includes("404") && retryCount < 3) {
            console.log(`Will retry in ${(retryCount + 1) * 1000}ms`)
            setTimeout(
              () => {
                setRetryCount((prev) => prev + 1)
              },
              (retryCount + 1) * 1000,
            )
            return
          }

          throw apiError
        }
      } catch (error: any) {
        console.error("Error in fetch function:", error)
        setError(error.message || "Failed to load request details. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (requestId && user && user.role === "citizen") {
      fetchRequestDetails()
    }
  }, [requestId, user, retryCount])

  const handleAccessService = async () => {
    if (!request?.PublicService?.URL) return

    setIsAccessingService(true)
    try {
      const accessToken = localStorage.getItem("accessToken")

      // First, make a HEAD request to check if the service is accessible
      const response = await fetch(request.PublicService.URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.ok) {
        // If the service responds successfully, open it in a new tab
        // We'll pass the token as a query parameter since we can't set headers in a new tab
        const serviceUrl = new URL(request.PublicService.URL)
        serviceUrl.searchParams.set("access_token", accessToken || "")

        window.open(serviceUrl.toString(), "_blank", "noopener,noreferrer")

        toast({
          title: "Service accessed",
          description: "The service has been opened in a new tab.",
        })
      } else {
        throw new Error(`Service returned ${response.status}: ${response.statusText}`)
      }
    } catch (error: any) {
      console.error("Error accessing service:", error)
      toast({
        title: "Service access failed",
        description: error.message || "Failed to access the service. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAccessingService(false)
    }
  }

  const getStatusIcon = () => {
    if (!request) return null

    if (request.Granted === false) {
      return <XCircle className="h-6 w-6 text-red-500" />
    } else if (request.Granted === true) {
      return <CheckCircle className="h-6 w-6 text-green-500" />
    } else {
      return <Clock className="h-6 w-6 text-amber-500" />
    }
  }

  const getStatusText = () => {
    if (!request) return ""

    if (request.Granted === false) {
      return "Rejected"
    } else if (request.Granted === true) {
      return "Approved"
    } else {
      return "Pending"
    }
  }

  const getStatusClass = () => {
    if (!request) return ""

    if (request.Granted === false) {
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
    } else if (request.Granted === true) {
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
    } else {
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
    }
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
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/citizen/requests">
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
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl">{request.Subject}</CardTitle>
                      <CardDescription>Request ID: {request.id}</CardDescription>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${getStatusClass()}`}
                    >
                      {getStatusIcon()}
                      {getStatusText()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Message</h3>
                    <p className="whitespace-pre-line">{request.Message}</p>
                  </div>

                  {request.Granted === true && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-900/50">
                      <h3 className="font-medium text-green-800 dark:text-green-300 mb-1">Request Approved</h3>
                      <p className="text-sm text-green-700 dark:text-green-400">
                        Your request has been approved and a grant has been issued.
                      </p>
                      {request.PublicService?.URL && (
                        <div className="mt-3">
                          <Button
                            onClick={handleAccessService}
                            disabled={isAccessingService}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {isAccessingService ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Accessing...
                              </>
                            ) : (
                              <>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Access Service
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {request.Granted === false && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-900/50">
                      <h3 className="font-medium text-red-800 dark:text-red-300 mb-1">Request Declined</h3>
                      <p className="text-sm text-red-700 dark:text-red-400">Your request has been declined.</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Submitted on {new Date(request.Created).toLocaleString()}
                  </p>
                </CardFooter>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Service Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Service</h3>
                    <p className="font-medium">{request.PublicService?.Title || "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Machine Name</h3>
                    <p className="text-sm font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      {request.PublicService?.MachineName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Citizen</h3>
                    <p className="text-sm">
                      {request.Citizen?.FirstName} {request.Citizen?.SecondName} ({request.Citizen?.UserName})
                    </p>
                    <p className="text-sm text-slate-500">{request.Citizen?.Email}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Alert>
            <AlertDescription>Request not found</AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  )
}
