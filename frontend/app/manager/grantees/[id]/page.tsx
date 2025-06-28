"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { directApi } from "@/lib/api-direct"
import { ArrowLeft, Edit, User, Mail, Phone, Calendar, Shield, Building, Briefcase } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export default function ManagerGranteeDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [grantee, setGrantee] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("details")
  const [services, setServices] = useState<any[]>([])
  const [associations, setAssociations] = useState<any[]>([])

  useEffect(() => {
    const fetchGrantee = async () => {
      try {
        setLoading(true)
        const response = await directApi.manager.getGrantee(id as string)
        if (response.ok) {
          const data = await response.json()
          setGrantee(data)
        } else {
          throw new Error("Failed to fetch grantee details")
        }
      } catch (err: any) {
        console.error("Error fetching grantee:", err)
        setError(err.message || "Failed to load grantee details")
        toast({
          title: "Error",
          description: "Failed to load grantee details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    const fetchServices = async () => {
      try {
        // Instead of trying to fetch services directly from a grantee endpoint,
        // we'll fetch all services and filter them client-side
        const response = await directApi.manager.getServices()
        if (response.ok) {
          const data = await response.json()
          // Filter services that are assigned to this grantee
          const granteeServices = data.filter(
            (service: any) => service.Grantee && service.Grantee.some((g: any) => g.id === id),
          )
          setServices(granteeServices)
        }
      } catch (err) {
        console.error("Error fetching services:", err)
        // Don't show an error toast for this, as it's not critical
      }
    }

    const fetchAssociations = async () => {
      try {
        // Instead of trying to fetch associations directly from a grantee endpoint,
        // we'll fetch all associations and filter them client-side
        const response = await directApi.manager.getAssociations()
        if (response.ok) {
          const data = await response.json()
          // Filter associations that are related to this grantee
          // This is a simplified approach - in a real app, you'd need to know how grantees and associations are related
          const granteeAssociations = data.filter((association: any) => {
            // Check if the grantee is associated with this association
            // This logic depends on your data structure
            return association.Grantees && association.Grantees.some((g: any) => g.id === id)
          })
          setAssociations(granteeAssociations)
        }
      } catch (err) {
        console.error("Error fetching associations:", err)
        // Don't show an error toast for this, as it's not critical
      }
    }

    if (id) {
      fetchGrantee()
      fetchServices()
      fetchAssociations()
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
              <CardTitle className="mb-2">Error Loading Grantee</CardTitle>
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

  if (!grantee) return null

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <DashboardLayout role="manager">
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Grantee Details</h1>
          </div>
          <Button onClick={() => router.push(`/manager/grantees/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Grantee
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>{grantee.GranteeUserName ? getInitials(grantee.GranteeUserName) : "G"}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{grantee.GranteeUserName}</CardTitle>
                <CardDescription>{grantee.FirstEmail}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="associations">Associations</TabsTrigger>
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
                      <span>{grantee.GranteeUserName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">Email:</span>
                      <span>{grantee.FirstEmail}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">Phone:</span>
                      <span>{grantee.Phone || "Not provided"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">Joined:</span>
                      <span>{grantee.Created ? format(new Date(grantee.Created), "PPP") : "Not available"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">Status:</span>
                      <Badge variant={grantee.Active ? "success" : "destructive"}>
                        {grantee.Active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {grantee.AdditionalInfo && Object.keys(grantee.AdditionalInfo).length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Additional Information</h3>
                    <Separator className="mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(grantee.AdditionalInfo).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">{key}:</span>
                          <span>{value?.toString() || "Not provided"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="services">
                {services.length > 0 ? (
                  <div className="space-y-4">
                    {services.map((service) => (
                      <Card key={service.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">{service.Title}</CardTitle>
                              <CardDescription>
                                {service.Association?.Title || "No Association"} - Created on{" "}
                                {new Date(service.Created).toLocaleDateString()}
                              </CardDescription>
                            </div>
                            <Badge variant={service.Active ? "success" : "secondary"}>
                              {service.Active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm line-clamp-2">{service.Description || "No description provided"}</p>
                        </CardContent>
                        <div className="px-6 pb-4">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/manager/services/${service.id}`}>
                              <Briefcase className="h-4 w-4 mr-2" />
                              View Service
                            </Link>
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>This grantee is not assigned to any services yet.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="associations">
                {associations.length > 0 ? (
                  <div className="space-y-4">
                    {associations.map((association) => (
                      <Card key={association.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">{association.Title}</CardTitle>
                              <CardDescription>
                                {association.Department?.Title || "No Department"} - Created on{" "}
                                {new Date(association.Created).toLocaleDateString()}
                              </CardDescription>
                            </div>
                            <Badge variant={association.Active ? "success" : "secondary"}>
                              {association.Active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm line-clamp-2">{association.Description || "No description provided"}</p>
                        </CardContent>
                        <div className="px-6 pb-4">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/manager/associations/${association.id}`}>
                              <Building className="h-4 w-4 mr-2" />
                              View Association
                            </Link>
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>This grantee is not assigned to any associations yet.</p>
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
