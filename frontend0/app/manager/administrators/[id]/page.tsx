"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { directApi } from "@/lib/api-direct"
import { ArrowLeft, Edit, User, Mail, Phone, Calendar, Shield, Building } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export default function ManagerAdministratorDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [administrator, setAdministrator] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("details")
  const [departments, setDepartments] = useState<any[]>([])

  useEffect(() => {
    const fetchAdministrator = async () => {
      try {
        setLoading(true)
        const response = await directApi.manager.getAdministrator(id as string)
        if (response.ok) {
          const data = await response.json()
          setAdministrator(data)
        } else {
          throw new Error("Failed to fetch administrator details")
        }
      } catch (err: any) {
        console.error("Error fetching administrator:", err)
        setError(err.message || "Failed to load administrator details")
        toast({
          title: "Error",
          description: "Failed to load administrator details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    const fetchDepartments = async () => {
      try {
        // Use Django's filtering pattern with double underscores to filter by Administrator PublicId
        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/manager/department/?Administrator__PublicId=${id}`
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setDepartments(data)
        } else {
          console.error("Failed to fetch departments")
        }
      } catch (err) {
        console.error("Error fetching departments:", err)
      }
    }

    if (id) {
      fetchAdministrator()
      fetchDepartments()
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
              <CardTitle className="mb-2">Error Loading Administrator</CardTitle>
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

  if (!administrator) return null

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
            <h1 className="text-2xl font-bold">Administrator Details</h1>
          </div>
          <Button onClick={() => router.push(`/manager/administrators/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Administrator
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  {administrator.AdminUserName ? getInitials(administrator.AdminUserName) : "A"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{administrator.AdminUserName}</CardTitle>
                <CardDescription>{administrator.FirstEmail}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="departments">Departments</TabsTrigger>
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
                      <span>{administrator.AdminUserName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">Email:</span>
                      <span>{administrator.FirstEmail}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">Phone:</span>
                      <span>{administrator.Phone || "Not provided"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">Joined:</span>
                      <span>
                        {administrator.Created ? format(new Date(administrator.Created), "PPP") : "Not available"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">Status:</span>
                      <Badge variant={administrator.Active ? "success" : "destructive"}>
                        {administrator.Active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {administrator.AdditionalInfo && Object.keys(administrator.AdditionalInfo).length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Additional Information</h3>
                    <Separator className="mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(administrator.AdditionalInfo).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">{key}:</span>
                          <span>{value?.toString() || "Not provided"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="departments">
                {departments.length > 0 ? (
                  <div className="space-y-4">
                    {departments.map((department) => (
                      <Card key={department.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">{department.Title}</CardTitle>
                              <CardDescription>
                                Created on {new Date(department.Created).toLocaleDateString()}
                              </CardDescription>
                            </div>
                            <Badge variant={department.Active ? "success" : "secondary"}>
                              {department.Active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm line-clamp-2">{department.Description || "No description provided"}</p>
                        </CardContent>
                        <div className="px-6 pb-4">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/manager/departments/${department.id}`}>
                              <Building className="h-4 w-4 mr-2" />
                              View Department
                            </Link>
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>This administrator is not assigned to any departments yet.</p>
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
