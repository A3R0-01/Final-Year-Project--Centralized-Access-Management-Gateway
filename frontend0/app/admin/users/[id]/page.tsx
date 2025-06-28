"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { directApi } from "@/lib/api-direct"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Edit, User, Mail, Phone, MapPin, Calendar, Shield } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"

export default function AdminUserDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("details")

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const response = await directApi.admin.getCitizen(id as string)
        if (response.ok) {
          const data = await response.json()
          setUser(data)
        } else {
          throw new Error("Failed to fetch user details")
        }
      } catch (err: any) {
        console.error("Error fetching user:", err)
        setError(err.message || "Failed to load user details")
        toast({
          title: "Error",
          description: "Failed to load user details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchUser()
    }
  }, [id, toast])

  if (loading) {
    return (
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
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="text-red-500 mb-4">
              <Shield className="h-12 w-12" />
            </div>
            <CardTitle className="mb-2">Error Loading User</CardTitle>
            <CardDescription>{error}</CardDescription>
            <Button className="mt-6" onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) return null

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">User Details</h1>
        </div>
        <Button onClick={() => router.push(`/admin/users/${id}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit User
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback>{user.name ? getInitials(user.name) : "U"}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user.name || "Unknown User"}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
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
                <h3 className="text-lg font-medium mb-2">Personal Information</h3>
                <Separator className="mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Full Name:</span>
                    <span>{user.name || "Not provided"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Email:</span>
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Phone:</span>
                    <span>{user.phone || "Not provided"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Address:</span>
                    <span>{user.address || "Not provided"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Joined:</span>
                    <span>{user.created_at ? format(new Date(user.created_at), "PPP") : "Not available"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Status:</span>
                    <Badge variant={user.is_active ? "success" : "destructive"}>
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Additional Information</h3>
                <Separator className="mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.additional_info &&
                    Object.entries(user.additional_info).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{key}:</span>
                        <span>{value?.toString() || "Not provided"}</span>
                      </div>
                    ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="requests">
              <div className="text-center py-8 text-gray-500">
                <p>Request history will be displayed here.</p>
              </div>
            </TabsContent>

            <TabsContent value="grants">
              <div className="text-center py-8 text-gray-500">
                <p>Grant history will be displayed here.</p>
              </div>
            </TabsContent>

            <TabsContent value="activity">
              <div className="text-center py-8 text-gray-500">
                <p>User activity log will be displayed here.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
