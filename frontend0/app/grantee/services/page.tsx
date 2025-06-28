"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { directApi } from "@/lib/api-direct"
import { Search, Briefcase } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function GranteeServicesPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [services, setServices] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredServices, setFilteredServices] = useState<any[]>([])

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    filterServices()
  }, [searchQuery, services])

  const fetchServices = async () => {
    setIsLoading(true)
    try {
      const response = await directApi.grantee.getServices()
      if (response.ok) {
        const data = await response.json()
        setServices(data)
        setFilteredServices(data)
      } else {
        throw new Error("Failed to fetch services")
      }
    } catch (error) {
      console.error("Error fetching services:", error)
      toast({
        title: "Error",
        description: "Failed to load services. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterServices = () => {
    if (searchQuery.trim() === "") {
      setFilteredServices(services)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = services.filter(
        (service) =>
          service.Title?.toLowerCase().includes(query) ||
          service.Description?.toLowerCase().includes(query) ||
          service.Association?.Title?.toLowerCase().includes(query),
      )
      setFilteredServices(filtered)
    }
  }

  return (
    <DashboardLayout role="grantee">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Services</h1>
            <p className="text-muted-foreground">Manage services assigned to you</p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search services..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Assigned Services</CardTitle>
            <CardDescription>Services you are authorized to manage</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                ))}
              </div>
            ) : filteredServices.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service Name</TableHead>
                      <TableHead>Association</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredServices.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">{service.Title}</TableCell>
                        <TableCell>{service.Association?.Title || "N/A"}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800"
                          >
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/grantee/services/${service.id}`}>View Details</Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Briefcase className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-medium mb-2">No services found</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                  {searchQuery
                    ? "No services match your search criteria. Try a different search term."
                    : "You don't have any services assigned to you yet."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
