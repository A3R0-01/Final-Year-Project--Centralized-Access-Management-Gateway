"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Search, Lock, Unlock, Eye, ExternalLink, Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { directApi } from "@/lib/api-direct"

export default function CitizenServicesPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  const [isLoading, setIsLoading] = useState(true)
  const [services, setServices] = useState<any[]>([])
  const [filteredServices, setFilteredServices] = useState<any[]>([])
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  // Check if user is authenticated and has the citizen role
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "citizen")) {
      toast({
        title: "Access denied",
        description: "You must be logged in as a citizen to view services.",
        variant: "destructive",
      })
      router.push("/auth/login?role=citizen")
    }
  }, [user, authLoading, router, toast])

  useEffect(() => {
    const fetchServices = async () => {
      if (!user || user.role !== "citizen") return

      try {
        console.log("Fetching citizen services...")
        setIsLoading(true)

        const response = await directApi.citizen.getServices()

        if (response.ok) {
          const data = await response.json()
          console.log("Services fetched successfully:", data)
          setServices(data)
          setFilteredServices(data)
          setError("")
        } else {
          throw new Error("Failed to fetch services")
        }
      } catch (error: any) {
        console.error("Error fetching services:", error)
        setError(error.message || "Failed to load services. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (user && user.role === "citizen") {
      fetchServices()
    }
  }, [user])

  // Filter services based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredServices(services)
    } else {
      const filtered = services.filter(
        (service) =>
          service.Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.Description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.Association?.Title?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredServices(filtered)
    }
  }, [searchTerm, services])

  // If still loading auth, show loading state
  if (authLoading) {
    return (
      <DashboardLayout role="citizen">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // If not a citizen, don't render the content
  if (!user || user.role !== "citizen") {
    return null // The useEffect will handle the redirect
  }

  return (
    <DashboardLayout role="citizen">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Available Services</h1>
            <p className="text-muted-foreground">Browse and access public services</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : filteredServices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? "No services found" : "No services available"}
              </h3>
              <p className="text-muted-foreground text-center">
                {searchTerm
                  ? "Try adjusting your search terms to find what you're looking for."
                  : "There are currently no services available for access."}
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm("")} className="mt-4">
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => (
              <Card key={service.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{service.Title}</CardTitle>
                      <CardDescription className="text-sm">
                        {service.Association?.Title || "No association"}
                      </CardDescription>
                    </div>
                    <Badge variant={service.Restricted ? "destructive" : "secondary"}>
                      {service.Restricted ? (
                        <>
                          <Lock className="h-3 w-3 mr-1" />
                          Restricted
                        </>
                      ) : (
                        <>
                          <Unlock className="h-3 w-3 mr-1" />
                          Public
                        </>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-3">{service.Description}</p>

                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Link href={`/citizen/services/${service.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Link>
                    </Button>
                    {service.Restricted ? (
                      <Button asChild size="sm" className="flex-1">
                        <Link href={`/citizen/requests?service=${service.id}`}>
                          <Plus className="h-4 w-4 mr-1" />
                          Request Access
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild size="sm" className="flex-1">
                        <Link href={`/citizen/services/${service.id}`}>
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Access
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
