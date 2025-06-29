"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Lock, Unlock, ExternalLink, Mail, Building2, FileText, Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { directApi } from "@/lib/api-direct"

export default function ServiceDetailPage() {
  const params = useParams()
  const serviceId = params?.id as string
  const { toast } = useToast()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  const [isLoading, setIsLoading] = useState(true)
  const [service, setService] = useState<any>(null)
  const [error, setError] = useState("")
  const [isAccessingService, setIsAccessingService] = useState(false)

  // Check if user is authenticated and has the citizen role
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "citizen")) {
      toast({
        title: "Access denied",
        description: "You must be logged in as a citizen to view service details.",
        variant: "destructive",
      })
      router.push("/auth/login?role=citizen")
    }
  }, [user, authLoading, router, toast])

  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!user || user.role !== "citizen") return

      try {
        console.log(`Fetching service details for ID: ${serviceId}`)
        setIsLoading(true)

        const response = await directApi.citizen.getService(serviceId)

        if (response.ok) {
          const data = await response.json()
          console.log("Service details fetched successfully:", data)
          setService(data)
          setError("")
        } else {
          throw new Error("Failed to fetch service details")
        }
      } catch (error: any) {
        console.error("Error fetching service details:", error)
        setError(error.message || "Failed to load service details. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (serviceId && user && user.role === "citizen") {
      fetchServiceDetails()
    }
  }, [serviceId, user])

  const handleAccessService = async () => {
    if (!service?.MachineName) return

    setIsAccessingService(true)
    try {
      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || ""
      const serviceUrl = `${gatewayUrl}/${service.MachineName}/`

      // Check if the service is accessible by making a HEAD request
      const accessToken = localStorage.getItem("accessToken")
      const response = await fetch(serviceUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.status === 401) {
        toast({
          title: "Access denied",
          description: "You don't have permission to access this service. Please request access first.",
          variant: "destructive",
        })
        return
      } else if (!response.ok) {
        toast({
          title: "Service unavailable",
          description: "The service is currently unavailable. Please try again later.",
          variant: "destructive",
        })
        return
      }

      // If successful, open the service in a new tab
      window.open(serviceUrl, "_blank", "noopener,noreferrer")

      toast({
        title: "Service accessed",
        description: "The service has been opened in a new tab.",
      })
    } catch (error: any) {
      console.error("Error accessing service:", error)
      toast({
        title: "Service unavailable",
        description: "The service is currently unavailable. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsAccessingService(false)
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
            <Link href="/citizen/services">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Service Details</h1>
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
        ) : service ? (
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl">{service.Title}</CardTitle>
                      <CardDescription className="mt-2">
                        <span className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                          {service.MachineName}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant={service.Restricted ? "destructive" : "secondary"}>
                        {service.Restricted ? (
                          <>
                            <Lock className="h-3 w-3 mr-1" />
                            Restricted Access
                          </>
                        ) : (
                          <>
                            <Unlock className="h-3 w-3 mr-1" />
                            Public Access
                          </>
                        )}
                      </Badge>
                      <Button onClick={handleAccessService} disabled={isAccessingService} size="sm" className="w-fit">
                        {isAccessingService ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Accessing...
                          </>
                        ) : (
                          <>
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Access Service
                          </>
                        )}
                      </Button>
                      {service.Restricted && (
                        <Button asChild size="sm" variant="outline" className="w-fit bg-transparent">
                          <Link href={`/citizen/requests?service=${service.id}`}>
                            <Plus className="h-4 w-4 mr-1" />
                            Make Request
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      Description
                    </h3>
                    <p className="whitespace-pre-line">{service.Description}</p>
                  </div>

                  {service.Email && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        Contact Email
                      </h3>
                      <a
                        href={`mailto:${service.Email}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                      >
                        {service.Email}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Association Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Association</h3>
                    <p className="font-medium">{service.Association?.Title || "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Department</h3>
                    <p>{service.Association?.Department || "N/A"}</p>
                  </div>
                  {service.Association?.Email && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Association Email</h3>
                      <a
                        href={`mailto:${service.Association.Email}`}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                      >
                        {service.Association.Email}
                      </a>
                    </div>
                  )}
                  {service.Association?.Website && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Association Website
                      </h3>
                      <a
                        href={service.Association.Website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline inline-flex items-center gap-1"
                      >
                        {service.Association.Website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Alert>
            <AlertDescription>Service not found</AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  )
}
