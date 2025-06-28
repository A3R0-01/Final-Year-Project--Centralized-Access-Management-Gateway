"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { directApi } from "@/lib/api-direct"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Building, Calendar, Clock, MapPin, Phone, Shield, User } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"

export default function GranteeServiceDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [service, setService] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("details")

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true)
        const response = await directApi.grantee.getService(id as string)
        if (response.ok) {
          const data = await response.json()
          setService(data)
        } else {
          throw new Error("Failed to fetch service details")
        }
      } catch (err: any) {
        console.error("Error fetching service:", err)
        setError(err.message || "Failed to load service details")
        toast({
          title: "Error",
          description: "Failed to load service details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchService()
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
              <div className="h-12 w-12 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
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
            <CardTitle className="mb-2">Error Loading Service</CardTitle>
            <CardDescription>{error}</CardDescription>
            <Button className="mt-6" onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!service) return null

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Service Details</h1>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl">{service.Title}</CardTitle>
              <CardDescription>{service.Description}</CardDescription>
            </div>
            <Badge className="mt-2 md:mt-0" variant={!service.Restricted ? "success" : "destructive"}>
              {!service.Restricted ? "Public" : "Restricted"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Service Information</h3>
                <Separator className="mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Association:</span>
                    <span>{service.Association?.Title || "Not assigned"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Machine Name:</span>
                    <span>{service.MachineName || "Not provided"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Email:</span>
                    <span>{service.Email || "Not provided"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">URL:</span>
                    <span>{service.URL || "Not provided"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Created:</span>
                    <span>{service.Created ? format(new Date(service.Created), "PPP") : "Not available"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Restricted:</span>
                    <Badge variant={service.Restricted ? "destructive" : "success"}>
                      {service.Restricted ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <Separator className="mb-4" />
                <div className="space-y-2">
                  {service.Description ? (
                    <div className="prose dark:prose-invert max-w-none">
                      <p>{service.Description}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No description provided.</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Assigned Grantees</h3>
                <Separator className="mb-4" />
                {service.Grantee && service.Grantee.length > 0 ? (
                  <ul className="space-y-2">
                    {service.Grantee.map((grantee: any, index: number) => (
                      <li key={index} className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>{grantee.GranteeUserName}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No grantees assigned.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
