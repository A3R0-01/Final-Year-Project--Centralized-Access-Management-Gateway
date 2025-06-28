"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Briefcase, FileText, ExternalLink, Mail, Edit, Building, Shield, User } from "lucide-react"
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
                    <CardDescription>
                      Service ID: {service.id} • Machine Name: {service.MachineName}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      <Briefcase className="h-4 w-4" />
                      <span>Service</span>
                    </div>
                    {service.Restricted && (
                      <Badge variant="destructive" className="text-xs">
                        Restricted
                      </Badge>
                    )}
                    {service.Visibility ? (
                      <Badge variant="default" className="text-xs">
                        Public
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Hidden
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details" onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="details">Service Details</TabsTrigger>
                    <TabsTrigger value="grantees">Grantees</TabsTrigger>
                    <TabsTrigger value="requests">Requests</TabsTrigger>
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
                          {service.Association?.Department || "N/A"}
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

                  <TabsContent value="grantees" className="mt-4">
                    {service.Grantee && service.Grantee.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Username</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {service.Grantee.map((grantee: any) => (
                              <TableRow key={grantee.id}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-slate-500" />
                                    {grantee.GranteeUserName}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Button asChild variant="outline" size="sm">
                                    <Link href={`/manager/grantees/${grantee.id}`}>View Details</Link>
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
                          <User className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                          <h3 className="text-lg font-medium mb-2">No grantees assigned</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                            This service doesn't have any grantees assigned yet.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="requests" className="mt-4">
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                        <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                        <h3 className="text-lg font-medium mb-2">Requests data not available</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                          Request information is not included in the service details response.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="permissions" className="mt-4">
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                        <Shield className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                        <h3 className="text-lg font-medium mb-2">Permissions data not available</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                          Permission information is not included in the service details response.
                        </p>
                      </CardContent>
                    </Card>
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
