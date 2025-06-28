"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { directApi } from "@/lib/api-direct"
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileText,
  MessageSquare,
  Paperclip,
  User,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/lib/auth-context"

export default function AdminRequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useAuth()

  const [isLoading, setIsLoading] = useState(true)
  const [request, setRequest] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [responseMessage, setResponseMessage] = useState("")

  // Check if user is authenticated and has the admin role
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      toast({
        title: "Access denied",
        description: "You must be logged in as an administrator to view this page.",
        variant: "destructive",
      })
      router.push("/auth/login?role=admin")
    }
  }, [user, authLoading, router, toast])

  useEffect(() => {
    if (params.id && user && user.role === "admin") {
      fetchRequestDetails()
    }
  }, [params.id, user])

  const fetchRequestDetails = async () => {
    setIsLoading(true)
    try {
      const response = await directApi.admin.getRequest(params.id as string)
      if (response.ok) {
        const data = await response.json()
        setRequest(data)
      } else {
        throw new Error("Failed to fetch request details")
      }
    } catch (error) {
      console.error("Error fetching request details:", error)
      toast({
        title: "Error",
        description: "Failed to load request details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async () => {
    setIsSubmitting(true)
    try {
      const response = await directApi.admin.approveRequest(params.id as string, { Message: responseMessage })
      if (response.ok) {
        toast({
          title: "Request approved",
          description: "The request has been approved successfully.",
          variant: "default",
        })
        fetchRequestDetails()
      } else {
        throw new Error("Failed to approve request")
      }
    } catch (error) {
      console.error("Error approving request:", error)
      toast({
        title: "Error",
        description: "Failed to approve request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    setIsSubmitting(true)
    try {
      const response = await directApi.admin.rejectRequest(params.id as string, { Message: responseMessage })
      if (response.ok) {
        toast({
          title: "Request rejected",
          description: "The request has been rejected successfully.",
          variant: "default",
        })
        fetchRequestDetails()
      } else {
        throw new Error("Failed to reject request")
      }
    } catch (error) {
      console.error("Error rejecting request:", error)
      toast({
        title: "Error",
        description: "Failed to reject request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (request: any) => {
    if (request.Decline) {
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800"
        >
          <XCircle className="h-3.5 w-3.5 mr-1" />
          Rejected
        </Badge>
      )
    } else if (request.Granted) {
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800"
        >
          <CheckCircle className="h-3.5 w-3.5 mr-1" />
          Approved
        </Badge>
      )
    } else {
      return (
        <Badge
          variant="outline"
          className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800"
        >
          <Clock className="h-3.5 w-3.5 mr-1" />
          Pending
        </Badge>
      )
    }
  }

  // If still loading auth, show loading state
  if (authLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // If not an admin, don't render the content
  if (!user || user.role !== "admin") {
    return null // The useEffect will handle the redirect
  }

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/requests">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="animate-pulse h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>

          <div className="animate-pulse space-y-4">
            <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            <div className="h-60 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!request) {
    return (
      <DashboardLayout role="admin">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium mb-2">Request not found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
            The request you are looking for does not exist or you do not have permission to view it.
          </p>
          <Button asChild>
            <Link href="/admin/requests">Back to Requests</Link>
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/requests">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">{request.Subject}</h1>
          </div>
          <div>{getStatusBadge(request)}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Request Details</CardTitle>
                <CardDescription>Submitted on {new Date(request.Created).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose dark:prose-invert max-w-none">
                  <p>{request.Message}</p>
                </div>

                {request.Attachments && request.Attachments.length > 0 && (
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium flex items-center mb-2">
                      <Paperclip className="h-4 w-4 mr-1" />
                      Attachments ({request.Attachments.length})
                    </h3>
                    <ul className="space-y-2">
                      {request.Attachments.map((attachment: any, index: number) => (
                        <li key={index} className="flex items-center justify-between">
                          <span className="text-sm">{attachment.filename}</span>
                          <Button variant="outline" size="sm" asChild>
                            <a href={attachment.url} download target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </a>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {(request.Granted || request.Decline) && (
              <Card>
                <CardHeader>
                  <CardTitle>Response</CardTitle>
                  <CardDescription>
                    {request.Granted ? "Approved" : "Rejected"} on{" "}
                    {new Date(request.Updated || request.Created).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none">
                    <p>{request.ResponseMessage || "No response message provided."}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {!request.Granted && !request.Decline && (
              <Card>
                <CardHeader>
                  <CardTitle>Respond to Request</CardTitle>
                  <CardDescription>Approve or reject this service request</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="response" className="text-sm font-medium">
                        Response Message
                      </label>
                      <Textarea
                        id="response"
                        placeholder="Enter your response message..."
                        rows={4}
                        value={responseMessage}
                        onChange={(e) => setResponseMessage(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={isSubmitting}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will reject the request and notify the citizen. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleReject}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Reject
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button disabled={isSubmitting}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Approval</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will approve the request and notify the citizen. Proceed?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleApprove}>Approve</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Citizen Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{request.Citizen?.UserName || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">{request.Citizen?.Email || "No email provided"}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Joined</p>
                    <p className="text-sm text-muted-foreground">
                      {request.Citizen?.Created ? new Date(request.Citizen.Created).toLocaleDateString() : "Unknown"}
                    </p>
                  </div>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/admin/citizens/${request.Citizen?.id}`}>View Citizen Profile</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">{request.PublicService?.Title || "Unknown Service"}</p>
                  <p className="text-sm text-muted-foreground">
                    {request.PublicService?.Description || "No description provided"}
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <MessageSquare className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Association</p>
                    <p className="text-sm text-muted-foreground">
                      {request.PublicService?.Association?.Title || "Not assigned"}
                    </p>
                  </div>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/admin/services/${request.PublicService?.id}`}>View Service Details</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
