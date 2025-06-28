"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Mail,
  BadgeIcon as IdCard,
  Building,
  Briefcase,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function RequestDetailPage() {
  const params = useParams()
  const requestId = params?.id as string
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [request, setRequest] = useState<any>(null)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("details")

  useEffect(() => {
    fetchRequestDetails()
  }, [requestId])

  const fetchRequestDetails = async () => {
    if (!requestId) return

    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manager/request/${requestId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })

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

  return (
    <DashboardLayout role="manager">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/manager/requests">
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
                    <TabsTrigger value="service">Service Info</TabsTrigger>
                    {(request.Granted || request.Decline) && <TabsTrigger value="grant">Grant Details</TabsTrigger>}
                  </TabsList>

                  <TabsContent value="details" className="mt-4 space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Message</h3>
                      <p className="whitespace-pre-line">{request.Message}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Submitted</h3>
                      <p>{new Date(request.Created).toLocaleString()}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Status</h3>
                      <p>{request.Decline ? "Rejected" : request.Granted ? "Approved" : "Pending"}</p>
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
                      <Link href={`/manager/users/citizen/${request.Citizen?.id}`}>View Full Profile</Link>
                    </Button>
                  </TabsContent>

                  <TabsContent value="service" className="mt-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-slate-500" />
                      <div>
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Service</h3>
                        <p>{request.PublicService?.Title || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-slate-500" />
                      <div>
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Department</h3>
                        <p>{request.PublicService?.Association?.Department?.Title || "N/A"}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Association</h3>
                      <p>{request.PublicService?.Association?.Title || "N/A"}</p>
                    </div>

                    <Button asChild variant="outline">
                      <Link href={`/manager/services/${request.PublicService?.id}`}>View Service Details</Link>
                    </Button>
                  </TabsContent>

                  {(request.Granted || request.Decline) && (
                    <TabsContent value="grant" className="mt-4 space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Status</h3>
                        <p className="font-medium">{request.Granted ? "Approved" : "Rejected"}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Message</h3>
                        <p className="whitespace-pre-line">{request.grant?.Message || "No message provided"}</p>
                      </div>

                      {request.Granted && (
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

                          <Button asChild variant="outline">
                            <Link href={`/manager/grants/${request.grant?.id}`}>View Grant Details</Link>
                          </Button>
                        </>
                      )}
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline">
                  <Link href="/manager/requests">Back to Requests</Link>
                </Button>
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
