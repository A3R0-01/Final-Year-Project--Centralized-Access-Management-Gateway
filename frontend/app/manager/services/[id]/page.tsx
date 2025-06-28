"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Briefcase, FileText, ExternalLink, Mail, Edit, Building, Shield } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function ServiceDetailPage() {
  const params = useParams()
  const serviceId = params?.id as string
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [service, setService] = useState<any>(null)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("details")

  useEffect(() => {
    fetchServiceDetails()
  }, [serviceId])

  const fetchServiceDetails = async () => {
    if (!serviceId) return

    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manager/service/${serviceId}/`, {
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

  return (
    <DashboardLayout role="manager">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/manager/services">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Service Details</h1>
          </div>
          {service && (
            <Button asChild>
              <Link href={`/manager/services/${serviceId}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Service
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
        ) : service ? (
          <>
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">{service.Title}</CardTitle>
                    <CardDescription>Service ID: {service.id}</CardDescription>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    <Briefcase className="h-5 w-5" />
                    <span>Service</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details" onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="details">Service Details</TabsTrigger>
                    <TabsTrigger value="requests">Requests</TabsTrigger>
                    <TabsTrigger value="grants">Grants</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="mt-4 space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Description</h3>
                      <p className="whitespace-pre-line">{service.Description || "No description provided"}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Association</h3>
                        <Link
                          href={`/manager/associations/${service.Association?.id}`}
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <Building className="h-4 w-4" />
                          {service.Association?.Title || "N/A"}
                        </Link>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Department</h3>
                        <Link
                          href={`/manager/departments/${service.Association?.Department?.id}`}
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <Building className="h-4 w-4" />
                          {service.Association?.Department?.Title || "N/A"}
                        </Link>
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
                              <ExternalLink className="h-4 w-4" />
                              <span>Visit Website</span>
                            </a>
                          </Button>
                        ) : (
                          <p>No website provided</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Created</h3>
                      <p>{new Date(service.Created).toLocaleString()}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="requests" className="mt-4">
                    {service.requests && service.requests.length > 0 ? (
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
                            {service.requests.map((request: any) => (
                              <TableRow key={request.id}>
                                <TableCell className="font-medium">{request.Subject}</TableCell>
                                <TableCell>
                                  <Link
                                    href={`/manager/users/citizen/${request.Citizen?.id}`}
                                    className="text-blue-600 hover:underline"
                                  >
                                    {request.Citizen?.UserName || "Unknown"}
                                  </Link>
                                </TableCell>
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
                                    <Link href={`/manager/requests/${request.id}`}>View</Link>
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
                    {service.grants && service.grants.length > 0 ? (
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
                            {service.grants.map((grant: any) => (
                              <TableRow key={grant.id}>
                                <TableCell className="font-medium">
                                  <Link
                                    href={`/manager/users/citizen/${grant.Request?.Citizen?.id}`}
                                    className="text-blue-600 hover:underline"
                                  >
                                    {grant.Request?.Citizen?.UserName || "Unknown"}
                                  </Link>
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
                                    <Link href={`/manager/grants/${grant.id}`}>View</Link>
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

                  <TabsContent value="permissions" className="mt-4">
                    <div className="flex justify-end mb-4">
                      <Button asChild>
                        <Link href={`/manager/permissions/new?type=service&serviceId=${serviceId}`}>
                          Add Service Permission
                        </Link>
                      </Button>
                    </div>
                    {service.permissions && service.permissions.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Grantee</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {service.permissions.map((permission: any) => (
                              <TableRow key={permission.id}>
                                <TableCell className="font-medium">
                                  <Link
                                    href={`/manager/users/grantee/${permission.Grantee?.id}`}
                                    className="text-blue-600 hover:underline"
                                  >
                                    {permission.Grantee?.GranteeUserName || "Unknown"}
                                  </Link>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={permission.Active ? "success" : "secondary"}
                                    className={
                                      permission.Active
                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                        : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                                    }
                                  >
                                    {permission.Active ? "Active" : "Inactive"}
                                  </Badge>
                                </TableCell>
                                <TableCell>{new Date(permission.Created).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                  <Button asChild variant="outline" size="sm">
                                    <Link href={`/manager/permissions/${permission.id}`}>View</Link>
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
                          <Shield className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                          <h3 className="text-lg font-medium mb-2">No permissions found</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
                            This service doesn't have any permissions assigned yet.
                          </p>
                          <Button asChild>
                            <Link href={`/manager/permissions/new?type=service&serviceId=${serviceId}`}>
                              Add Service Permission
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter>
                <div className="flex gap-2">
                  <Button asChild variant="outline">
                    <Link href="/manager/services">Back to Services</Link>
                  </Button>
                  <Button asChild>
                    <Link href={`/manager/services/${serviceId}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Service
                    </Link>
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
