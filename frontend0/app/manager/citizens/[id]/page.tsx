"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { directApi } from "@/lib/api-direct"
import { ArrowLeft, Edit, User, Mail, Phone, Calendar, Shield, FileText, Clock } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ManagerCitizenDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [citizen, setCitizen] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("details")
  const [requests, setRequests] = useState<any[]>([])
  const [grants, setGrants] = useState<any[]>([])

  useEffect(() => {
    const fetchCitizen = async () => {
      try {
        setLoading(true)
        const response = await directApi.manager.getCitizen(id as string)
        if (response.ok) {
          const data = await response.json()
          setCitizen(data)
        } else {
          throw new Error("Failed to fetch citizen details")
        }
      } catch (err: any) {
        console.error("Error fetching citizen:", err)
        setError(err.message || "Failed to load citizen details")
        toast({
          title: "Error",
          description: "Failed to load citizen details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    const fetchRequests = async () => {
      try {
        // Fetch all requests and filter by citizen
        const response = await directApi.manager.getRequests()
        if (response.ok) {
          const data = await response.json()
          // Filter requests that belong to this citizen
          const citizenRequests = data.filter((request: any) => request.Citizen && request.Citizen.id === id)
          setRequests(citizenRequests)
        }
      } catch (err) {
        console.error("Error fetching requests:", err)
      }
    }

    const fetchGrants = async () => {
      try {
        // Fetch all grants and filter by citizen
        const response = await directApi.manager.getGrants()
        if (response.ok) {
          const data = await response.json()
          // Filter grants that belong to this citizen
          const citizenGrants = data.filter((grant: any) => grant.Citizen && grant.Citizen.id === id)
          setGrants(citizenGrants)
        }
      } catch (err) {
        console.error("Error fetching grants:", err)
      }
    }

    if (id) {
      fetchCitizen()
      fetchRequests()
      fetchGrants()
    }
  }, [id, toast])

  if (loading) {
    return (
      <DashboardLayout role="manager">
        <div className="container mx-auto py-6 space-y-8">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="animate-pulse">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="h-7 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout role="manager">
        <div className="container mx-auto py-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <div className="text-red-500 mb-4">
                <Shield className="h-12 w-12" />
              </div>
              <CardTitle className="mb-2">Error Loading Citizen</CardTitle>
              <CardDescription>{error}</CardDescription>
              <Button className="mt-6" onClick={() => router.back()}>
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (!citizen) return null

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase()
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <Badge variant="success">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      default:
        return <Badge variant="secondary">{status || "Unknown"}</Badge>
    }
  }

  return (
    <DashboardLayout role="manager">
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Citizen Details</h1>
          </div>
          <Button onClick={() => router.push(`/manager/citizens/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Citizen
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>{getInitials(citizen.FirstName, citizen.Surname)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>
                  {citizen.FirstName} {citizen.Surname}
                </CardTitle>
                <CardDescription>{citizen.Email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="requests">Requests</TabsTrigger>
                <TabsTrigger value="grants">Grants</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Basic Information</h3>
                  <Separator className="mb-4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">Username:</span>
                      <span>{citizen.UserName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">Full Name:</span>
                      <span>
                        {citizen.FirstName} {citizen.Surname}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">Email:</span>
                      <span>{citizen.Email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">Phone:</span>
                      <span>{citizen.Phone || "Not provided"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">Joined:</span>
                      <span>{citizen.Created ? format(new Date(citizen.Created), "PPP") : "Not available"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">Status:</span>
                      <Badge variant={citizen.Active ? "success" : "destructive"}>
                        {citizen.Active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {citizen.AdditionalInfo && Object.keys(citizen.AdditionalInfo).length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Additional Information</h3>
                    <Separator className="mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(citizen.AdditionalInfo).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">{key}:</span>
                          <span>{value?.toString() || "Not provided"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="requests">
                {requests.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Service</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {requests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.Service?.Title || "Unknown Service"}</TableCell>
                            <TableCell>{getStatusBadge(request.Status)}</TableCell>
                            <TableCell>
                              {request.Created ? format(new Date(request.Created), "PPP") : "Unknown"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/manager/requests/${request.id}`}>
                                  <FileText className="h-4 w-4 mr-2" />
                                  View
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>This citizen has not submitted any requests yet.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="grants">
                {grants.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Service</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Granted</TableHead>
                          <TableHead>Expires</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {grants.map((grant) => (
                          <TableRow key={grant.id}>
                            <TableCell className="font-medium">{grant.Service?.Title || "Unknown Service"}</TableCell>
                            <TableCell>{getStatusBadge(grant.Status)}</TableCell>
                            <TableCell>{grant.Created ? format(new Date(grant.Created), "PPP") : "Unknown"}</TableCell>
                            <TableCell>
                              {grant.ExpiryDate ? format(new Date(grant.ExpiryDate), "PPP") : "No expiry"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/manager/grants/${grant.id}`}>
                                  <Clock className="h-4 w-4 mr-2" />
                                  View
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>This citizen has not received any grants yet.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity">
                <div className="text-center py-8 text-gray-500">
                  <p>Activity history will be displayed here.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
