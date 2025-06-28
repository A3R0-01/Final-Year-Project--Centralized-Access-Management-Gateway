"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { directApi } from "@/lib/api-direct"
import { ArrowLeft, Edit, User, Mail, Calendar, Shield, Building, Briefcase } from "lucide-react"
import { format } from "date-fns"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

export default function ManagerGranteeDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [grantee, setGrantee] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("details")

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

    if (id) {
      fetchGrantee()
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
                <TabsTrigger value="association">Association</TabsTrigger>
                <TabsTrigger value="citizen">Citizen Info</TabsTrigger>
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
                      <span className="text-sm text-gray-500">Primary Email:</span>
                      <span>{grantee.FirstEmail}</span>
                    </div>
                    {grantee.SecondEmail && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-500">Secondary Email:</span>
                        <span>{grantee.SecondEmail}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">Created:</span>
                      <span>{grantee.Created ? format(new Date(grantee.Created), "PPP") : "Not available"}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="association" className="space-y-6">
                {grantee.Association ? (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Association Details</h3>
                    <Separator className="mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-500">Association:</span>
                        <span>{grantee.Association.Title}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-500">Department:</span>
                        <span>{grantee.Association.Department || "N/A"}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-500">Association Email:</span>
                        <span>{grantee.Association.Email || "N/A"}</span>
                      </div>
                      {grantee.Association.Website && (
                        <div className="flex items-center space-x-2">
                          <Briefcase className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-500">Website:</span>
                          <a
                            href={grantee.Association.Website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {grantee.Association.Website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No association assigned to this grantee.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="citizen" className="space-y-6">
                {grantee.Citizen ? (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Citizen Information</h3>
                    <Separator className="mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-500">Username:</span>
                        <span>{grantee.Citizen.UserName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-500">National ID:</span>
                        <span>{grantee.Citizen.NationalId}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No citizen information available.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
