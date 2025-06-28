"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Briefcase, FileText, Mail, Globe, Lock, Unlock, Eye, EyeOff, UserCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function AdminServiceDetailPage() {
  const params = useParams()
  const serviceId = params?.id as string
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [service, setService] = useState<any>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [grants, setGrants] = useState<any[]>([])
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("details")

  useEffect(() => {
    if (serviceId) {
      fetchServiceDetails()
    }
  }, [serviceId])

  useEffect(() => {
    if (serviceId && activeTab === "requests") {
      fetchServiceRequests()
    } else if (serviceId && activeTab === "grants") {
      fetchServiceGrants()
    }
  }, [serviceId, activeTab])

  const fetchServiceDetails = async () => {
    if (!serviceId) return

    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/service/${serviceId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch service details")
      }

      const data = await response.json()
      setService(data)
    } catch (error) {
      console.error("Error fetching service details:", error)
      setError("Failed to load service details. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchServiceRequests = async () => {
    try {
      // Use the proper filtering format with double underscores for related fields
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/request/?PublicService__PublicId=${serviceId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to fetch service requests")
      }

      const data = await response.json()
      setRequests(data)
    } catch (error) {
      console.error("Error fetching service requests:", error)
      toast({
        title: "Error",
        description: "Failed to load service requests. Please try again.",
        variant: "destructive",
      })
    }
  }

  const fetchServiceGrants = async () => {
    try {
      // Use the proper filtering format with double underscores for related fields
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/grant/?Request__PublicService__PublicId=${serviceId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to fetch service grants")
      }

      const data = await response.json()
      setGrants(data)
    } catch (error) {
      console.error("Error fetching service grants:", error)
      toast({
        title: "Error",
        description: "Failed to load service grants. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/services">
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
          <>
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">{service.Title}</CardTitle>
                    <CardDescription>Service ID: {service.id}</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      <Briefcase className="h-4 w-4" />
                      <span>Service</span>
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                        service.Restricted
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                          : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      }`}
                    >
                      {service.Restricted ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                      <span>{service.Restricted ? "Restricted" : "Unrestricted"}</span>
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                        service.Visibility
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300"
                      }`}
                    >
                      {service.Visibility ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      <span>{service.Visibility ? "Public" : "Private"}</span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details" onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="details">Service Details</TabsTrigger>
                    <TabsTrigger value="grantees">Grantees</TabsTrigger>
                    <TabsTrigger value="requests">Requests</TabsTrigger>
                    <TabsTrigger value="grants">Grants</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="mt-4 space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Description</h3>
                      <p className="whitespace-pre-line">{service.Description || "No description provided"}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Association</h3>
                        <p>{service.Association?.Title || "N/A"}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Department</h3>
                        <p>{service.Association?.Department?.Title || "N/A"}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Machine Name</h3>
                        <p className="font-mono text-sm">{service.MachineName || "N/A"}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Allowed Methods</h3>
                        <div className="flex flex-wrap gap-1">
                          {service.Methods && service.Methods.length > 0 ? (
                            service.Methods.map((method: string, index: number) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                              >
                                {method}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-slate-500">No methods specified</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Contact Email</h3>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-500" />
                          <p>{service.Email || "N/A"}</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Website</h3>
                        {service.URL ? (
                          <Button asChild variant="outline" size="sm">
                            <a
                              href={service.URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              <Globe className="h-4 w-4" />
                              <span>Visit Website</span>
                            </a>
                          </Button>
                        ) : (
                          <p>No website provided</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Grantees</h3>
                      {service.Grantee && service.Grantee.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {service.Grantee.map((grantee: any) => (
                            <Badge
                              key={grantee.id}
                              variant="outline"
                              className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                            >
                              {grantee.GranteeUserName}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500">No grantees assigned</p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Created</h3>
                      <p>{new Date(service.Created).toLocaleString()}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="grantees" className="mt-4">
                    {service.Grantee && service.Grantee.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Username</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Association</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {service.Grantee.map((grantee: any) => (
                              <TableRow key={grantee.id}>
                                <TableCell className="font-medium">{grantee.GranteeUserName}</TableCell>
                                <TableCell>{grantee.FirstEmail || "N/A"}</TableCell>
                                <TableCell>{service.Association?.Title || "N/A"}</TableCell>
                                <TableCell className="text-right">
                                  <Button asChild variant="outline" size="sm">
                                    <Link href={`/admin/grantees/${grantee.id}`}>View</Link>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                          <UserCircle className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                          <h3 className="text-lg font-medium mb-2">No grantees found</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                            This service doesn't have any grantees assigned yet.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="requests" className="mt-4">
                    {requests && requests.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Subject</TableHead>
                              <TableHead>Citizen</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {requests.map((request: any) => (
                              <TableRow key={request.id}>
                                <TableCell className="font-medium">{request.Subject}</TableCell>
                                <TableCell>{request.Citizen?.UserName || "Unknown"}</TableCell>
                                <TableCell>{new Date(request.Created).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={
                                      request.Decline
                                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800"
                                        : request.Granted
                                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800"
                                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                                    }
                                  >
                                    {request.Decline ? "Rejected" : request.Granted ? "Approved" : "Pending"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button asChild variant="outline" size="sm">
                                    <Link href={`/admin/requests/${request.id}`}>View</Link>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                          <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                          <h3 className="text-lg font-medium mb-2">No requests found</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                            This service doesn't have any requests yet.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="grants" className="mt-4">
                    {grants && grants.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Citizen</TableHead>
                              <TableHead>Start Date</TableHead>
                              <TableHead>End Date</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {grants.map((grant: any) => (
                              <TableRow key={grant.id}>
                                <TableCell className="font-medium">
                                  {grant.Request?.Citizen?.UserName || "Unknown"}
                                </TableCell>
                                <TableCell>
                                  {grant.StartDate ? new Date(grant.StartDate).toLocaleDateString() : "N/A"}
                                </TableCell>
                                <TableCell>
                                  {grant.EndDate ? new Date(grant.EndDate).toLocaleDateString() : "N/A"}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={
                                      grant.Decline
                                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800"
                                        : grant.Granted && grant.EndDate && new Date(grant.EndDate) < new Date()
                                          ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                                          : grant.Granted
                                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800"
                                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                                    }
                                  >
                                    {grant.Decline
                                      ? "Declined"
                                      : grant.Granted && grant.EndDate && new Date(grant.EndDate) < new Date()
                                        ? "Expired"
                                        : grant.Granted
                                          ? "Active"
                                          : "Pending"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button asChild variant="outline" size="sm">
                                    <Link href={`/admin/grants/${grant.id}`}>View</Link>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                          <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                          <h3 className="text-lg font-medium mb-2">No grants found</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                            This service doesn't have any grants yet.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter>
                <div className="flex gap-2">
                  <Button asChild variant="outline">
                    <Link href="/admin/services">Back to Services</Link>
                  </Button>
                  <Button asChild>
                    <Link href={`/admin/services/${serviceId}/edit`}>Edit Service</Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </>
        ) : (
          <Alert>
            <AlertDescription>Service not found</AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  )
}
